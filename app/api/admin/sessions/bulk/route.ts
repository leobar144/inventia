import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { bogotaToUtcIso, generateDates, MAX_BULK_SESSIONS } from '@/lib/schedule'

/**
 * Crea varias sesiones de clase de una sola vez: elige curso, fecha de inicio,
 * días de la semana, hora y cuántas clases, y quedan todas programadas.
 *
 * Cargar un plan Semestre a mano son 24 formularios. Esto es lo que hace que
 * montar un curso completo sea cuestión de segundos.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { courseId, startDate, time, weekdays, count, modality, googleMeetLink } =
    (await request.json()) as {
      courseId: string
      startDate: string
      time: string
      weekdays: number[]
      count: number
      modality: 'presencial' | 'virtual'
      googleMeetLink?: string | null
    }

  if (!courseId || !startDate || !time || !Array.isArray(weekdays) || !count || !modality) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (weekdays.length === 0) {
    return NextResponse.json({ error: 'Elige al menos un día de la semana' }, { status: 400 })
  }

  if (count < 1 || count > MAX_BULK_SESSIONS) {
    return NextResponse.json(
      { error: `La cantidad debe estar entre 1 y ${MAX_BULK_SESSIONS}` },
      { status: 400 }
    )
  }

  const admin = createServiceRoleClient()

  const { data: course } = await admin
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }

  // La numeración continúa donde iba el curso, para no repetir "Clase 1" si ya
  // existían sesiones cargadas antes.
  const { count: existingCount } = await admin
    .from('class_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId)

  const startNumber = (existingCount ?? 0) + 1
  const dates = generateDates({ startDate, weekdays, count })

  if (dates.length === 0) {
    return NextResponse.json({ error: 'No se pudo generar ninguna fecha' }, { status: 400 })
  }

  const rows = dates.map((date, i) => ({
    course_id: courseId,
    title: `Clase ${startNumber + i}`,
    scheduled_at: bogotaToUtcIso(date, time),
    modality,
    module_number: null,
    google_meet_link: modality === 'virtual' ? googleMeetLink || null : null,
  }))

  const { error: insertError } = await admin.from('class_sessions').insert(rows)

  if (insertError) {
    return NextResponse.json({ error: 'No pudimos crear las sesiones' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    created: rows.length,
    firstDate: dates[0],
    lastDate: dates[dates.length - 1],
  })
}
