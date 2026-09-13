import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { bogotaToUtcIso, generateDates, MAX_BULK_SESSIONS } from '@/lib/schedule'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 403 }) }
  }

  return { user }
}

/**
 * Crea las tardes de sala en lote.
 *
 * Reutiliza `generateDates` y `bogotaToUtcIso` de lib/schedule — el mismo código
 * que usa el generador de clases. Es deliberado: la migración 027 existió porque
 * una fecha se guardó sin zona horaria y las clases aparecieron cinco horas
 * tarde. No hay una segunda implementación donde se pueda repetir.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const {
    startDate,
    weekdays,
    count,
    startTime,
    endTime,
    monitorId,
    capacity,
    modality,
    meetingLink,
  } = (await request.json()) as {
    startDate?: string
    weekdays?: number[]
    count?: number
    startTime?: string
    endTime?: string
    monitorId?: string | null
    capacity?: number | null
    modality?: string
    meetingLink?: string | null
  }

  if (!startDate || !weekdays?.length || !count || !startTime || !endTime) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (count > MAX_BULK_SESSIONS) {
    return NextResponse.json(
      { error: `No se pueden crear más de ${MAX_BULK_SESSIONS} tardes a la vez.` },
      { status: 400 }
    )
  }

  if (endTime <= startTime) {
    return NextResponse.json({ error: 'La hora de fin debe ser después del inicio.' }, { status: 400 })
  }

  const dates = generateDates({ startDate, weekdays, count })
  if (dates.length === 0) {
    return NextResponse.json({ error: 'No se generó ninguna fecha.' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const resolvedModality = modality === 'virtual' ? 'virtual' : 'presencial'

  // No duplicar una tarde que ya existe: es fácil correr el generador dos veces
  // y terminar con dos bloques del mismo día, cada uno con media bitácora.
  //
  // La llave es hora + MODALIDAD, no solo la hora: la sala presencial y la
  // virtual corren a la misma hora y son tardes distintas. Comparando solo la
  // hora, las virtuales se habrían descartado en silencio.
  const { data: existing } = await admin
    .from('tutoring_blocks')
    .select('starts_at, modality')
    .gte('starts_at', bogotaToUtcIso(dates[0], startTime))
    .lte('starts_at', bogotaToUtcIso(dates[dates.length - 1], endTime))

  const taken = new Set((existing ?? []).map((b) => `${b.starts_at}|${b.modality}`))

  const rows = dates
    .map((date) => ({
      starts_at: bogotaToUtcIso(date, startTime),
      ends_at: bogotaToUtcIso(date, endTime),
      monitor_id: monitorId || null,
      // null = sin límite. Es lo normal en virtual: no hay sillas que se acaben.
      capacity: capacity && capacity > 0 ? capacity : null,
      modality: resolvedModality,
      meeting_link: meetingLink?.trim() || null,
    }))
    .filter((r) => !taken.has(`${r.starts_at}|${r.modality}`))

  if (rows.length === 0) {
    return NextResponse.json({ created: 0, skipped: dates.length })
  }

  const { error } = await admin.from('tutoring_blocks').insert(rows)
  if (error) {
    return NextResponse.json({ error: 'No pudimos crear las tardes' }, { status: 500 })
  }

  return NextResponse.json({ created: rows.length, skipped: dates.length - rows.length })
}

/** Cambiar el monitor, el cupo o la modalidad de una tarde ya creada. */
export async function PATCH(request: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { blockId, monitorId, capacity, modality, meetingLink, notes } =
    (await request.json()) as {
      blockId?: string
      monitorId?: string | null
      capacity?: number | null
      modality?: string
      meetingLink?: string | null
      notes?: string | null
    }

  if (!blockId) return NextResponse.json({ error: 'Falta el bloque' }, { status: 400 })

  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('tutoring_blocks')
    .update({
      monitor_id: monitorId || null,
      capacity: capacity && capacity > 0 ? capacity : null,
      modality: modality === 'virtual' ? 'virtual' : 'presencial',
      meeting_link: meetingLink?.trim() || null,
      notes: notes?.trim() || null,
    })
    .eq('id', blockId)

  if (error) return NextResponse.json({ error: 'No pudimos actualizar' }, { status: 500 })
  return NextResponse.json({ success: true })
}

/**
 * Asignar un monitor a MUCHAS tardes de una vez.
 *
 * Existe porque la alternativa es abrir 94 tardes una por una. Con varios
 * profesores rotando —que es el caso real— asignar de a una no se hace, y las
 * tardes se quedan sin monitor hasta que alguien reclama.
 *
 * Se asigna por modalidad y rango de fechas: "Monica, presencial, de septiembre
 * a octubre" es como se piensa un horario de verdad.
 */
export async function PUT(request: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { monitorId, modality, fromDate, toDate, onlyUnassigned } = (await request.json()) as {
    monitorId?: string | null
    modality?: string
    fromDate?: string
    toDate?: string
    onlyUnassigned?: boolean
  }

  if (!fromDate || !toDate) {
    return NextResponse.json({ error: 'Faltan las fechas' }, { status: 400 })
  }

  if (toDate < fromDate) {
    return NextResponse.json(
      { error: 'La fecha final debe ser después de la inicial.' },
      { status: 400 }
    )
  }

  const admin = createServiceRoleClient()

  // El rango se interpreta en hora de Bogotá y se convierte a UTC, igual que al
  // crear las tardes. Comparar contra fechas sin zona dejaría fuera la última
  // tarde del rango, o metería una del día siguiente.
  let query = admin
    .from('tutoring_blocks')
    .update({ monitor_id: monitorId || null })
    .gte('starts_at', bogotaToUtcIso(fromDate, '00:00'))
    .lte('starts_at', bogotaToUtcIso(toDate, '23:59'))

  if (modality === 'presencial' || modality === 'virtual') {
    query = query.eq('modality', modality)
  }

  // Para no pisar lo que ya está asignado a otro profesor sin querer.
  if (onlyUnassigned) {
    query = query.is('monitor_id', null)
  }

  const { data, error } = await query.select('id')

  if (error) {
    return NextResponse.json({ error: 'No pudimos asignar el monitor' }, { status: 500 })
  }

  return NextResponse.json({ updated: data?.length ?? 0 })
}

/** Borrar una tarde que no se va a dictar. */
export async function DELETE(request: Request) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { searchParams } = new URL(request.url)
  const blockId = searchParams.get('blockId')
  if (!blockId) return NextResponse.json({ error: 'Falta el bloque' }, { status: 400 })

  const admin = createServiceRoleClient()

  // Si ya hay bitácora escrita, borrar el bloque se llevaría por delante el
  // registro de lo que hicieron los niños. Se avisa en vez de borrar en silencio.
  const { count } = await admin
    .from('tutoring_attendance')
    .select('id', { count: 'exact', head: true })
    .eq('block_id', blockId)

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `Esa tarde ya tiene ${count} registro(s) de niños. No se puede borrar.` },
      { status: 409 }
    )
  }

  const { error } = await admin.from('tutoring_blocks').delete().eq('id', blockId)
  if (error) return NextResponse.json({ error: 'No pudimos borrar' }, { status: 500 })

  return NextResponse.json({ success: true })
}
