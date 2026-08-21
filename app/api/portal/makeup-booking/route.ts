import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { makeupAllowance, isWithinMakeupWindow } from '@/lib/makeup'

/**
 * Agenda la reposición de una clase perdida.
 *
 * Todas las reglas se revalidan aquí aunque la interfaz ya las haya aplicado:
 * el cupo del grupo, el plazo de 30 días y el límite del plan son decisiones
 * con costo real, y el cliente no es fuente de verdad para ninguna.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { childId, missedSessionId, makeupSessionId } = (await request.json()) as {
    childId: string
    missedSessionId: string
    makeupSessionId: string
  }

  if (!childId || !missedSessionId || !makeupSessionId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (missedSessionId === makeupSessionId) {
    return NextResponse.json({ error: 'Elige una clase distinta' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .maybeSingle()

  if (!child) {
    return NextResponse.json({ error: 'Hijo/a no encontrado' }, { status: 404 })
  }

  const [{ data: missedSession }, { data: makeupSession }] = await Promise.all([
    admin
      .from('class_sessions')
      .select('id, course_id, scheduled_at')
      .eq('id', missedSessionId)
      .maybeSingle(),
    admin
      .from('class_sessions')
      .select('id, course_id, scheduled_at')
      .eq('id', makeupSessionId)
      .maybeSingle(),
  ])

  if (!missedSession || !makeupSession) {
    return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
  }

  // La reposición tiene que ser del mismo curso: un niño de Scratch no puede
  // meterse a una clase de Robótica.
  if (missedSession.course_id !== makeupSession.course_id) {
    return NextResponse.json(
      { error: 'La clase de reposición debe ser del mismo curso' },
      { status: 400 }
    )
  }

  const now = new Date()

  if (new Date(makeupSession.scheduled_at) <= now) {
    return NextResponse.json({ error: 'Esa clase ya pasó' }, { status: 400 })
  }

  if (!isWithinMakeupWindow(missedSession.scheduled_at, now)) {
    return NextResponse.json(
      { error: 'Esa clase ya superó el plazo de 30 días para recuperarse' },
      { status: 400 }
    )
  }

  const courseId = missedSession.course_id

  const [{ data: enrollment }, { data: attended }, { data: usedBookings }] = await Promise.all([
    admin
      .from('enrollments')
      .select('classes_purchased, status')
      .eq('student_id', childId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle(),
    admin
      .from('class_attendance')
      .select('id')
      .eq('child_id', childId)
      .eq('session_id', missedSessionId)
      .maybeSingle(),
    admin
      .from('makeup_bookings')
      .select('id')
      .eq('child_id', childId)
      .eq('course_id', courseId),
  ])

  if (!enrollment) {
    return NextResponse.json(
      { error: 'No hay una inscripción activa en ese curso' },
      { status: 400 }
    )
  }

  // Si sí asistió, no hay nada que reponer.
  if (attended) {
    return NextResponse.json({ error: 'Esa clase figura como asistida' }, { status: 400 })
  }

  const allowance = makeupAllowance(enrollment.classes_purchased)
  if ((usedBookings?.length ?? 0) >= allowance) {
    return NextResponse.json(
      { error: 'Ya usaste todas las recuperaciones de este plan' },
      { status: 400 }
    )
  }

  // Cupo del grupo: inscritos activos + reposiciones ya agendadas en esa sesión.
  const [{ data: course }, { data: activeEnrollments }, { data: sessionMakeups }] =
    await Promise.all([
      admin.from('courses').select('max_students').eq('id', courseId).maybeSingle(),
      admin.from('enrollments').select('id').eq('course_id', courseId).eq('status', 'active'),
      admin.from('makeup_bookings').select('id').eq('makeup_session_id', makeupSessionId),
    ])

  const maxStudents = course?.max_students ?? 8
  const occupied = (activeEnrollments?.length ?? 0) + (sessionMakeups?.length ?? 0)

  if (occupied >= maxStudents) {
    return NextResponse.json(
      { error: 'Ese horario ya se llenó. Elige otro.' },
      { status: 409 }
    )
  }

  const { error: insertError } = await admin.from('makeup_bookings').insert({
    child_id: childId,
    course_id: courseId,
    missed_session_id: missedSessionId,
    makeup_session_id: makeupSessionId,
  })

  if (insertError) {
    // El índice único es lo que atrapa un doble clic: la misma clase perdida no
    // puede consumir dos cupos.
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Esa clase ya tiene una reposición agendada' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'No pudimos agendar la reposición' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
