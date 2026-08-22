import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado', status: 401 as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'No autorizado', status: 403 as const }

  return { user }
}

/** Edita una clase ya programada: título, fecha y hora, modalidad o link. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { sessionId } = await params
  const { title, scheduledAt, modality, googleMeetLink, moduleNumber } =
    (await request.json()) as {
      title?: string
      scheduledAt?: string
      modality?: 'presencial' | 'virtual'
      googleMeetLink?: string | null
      moduleNumber?: number | null
    }

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title.trim()
  if (scheduledAt !== undefined) updates.scheduled_at = scheduledAt
  if (modality !== undefined) updates.modality = modality
  if (googleMeetLink !== undefined) updates.google_meet_link = googleMeetLink || null
  if (moduleNumber !== undefined) updates.module_number = moduleNumber

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('class_sessions').update(updates).eq('id', sessionId)

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el cambio' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

/**
 * Borra una clase programada.
 *
 * Se niega si ya tiene asistencia registrada: borrarla dejaría a los niños con
 * un contador de clases y un avance que no corresponden a ninguna clase real.
 * Si de verdad hay que eliminarla, primero se quita la asistencia.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { sessionId } = await params
  const admin = createServiceRoleClient()

  const { count: attendanceCount } = await admin
    .from('class_attendance')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  if ((attendanceCount ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `No se puede borrar: ya tiene ${attendanceCount} asistencia(s) registrada(s). Cambia la fecha en vez de borrarla.`,
      },
      { status: 409 }
    )
  }

  const { count: makeupCount } = await admin
    .from('makeup_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('makeup_session_id', sessionId)

  if ((makeupCount ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `No se puede borrar: hay ${makeupCount} recuperación(es) agendada(s) en esta clase.`,
      },
      { status: 409 }
    )
  }

  const { error } = await admin.from('class_sessions').delete().eq('id', sessionId)

  if (error) {
    return NextResponse.json({ error: 'No pudimos borrar la clase' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
