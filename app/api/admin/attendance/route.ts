import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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

  const { sessionId, childIds } = (await request.json()) as {
    sessionId: string
    childIds: string[]
  }

  if (!sessionId || !Array.isArray(childIds)) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: session, error: sessionError } = await admin
    .from('class_sessions')
    .select('course_id')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  if (childIds.length > 0) {
    const rows = childIds.map((childId) => ({
      child_id: childId,
      session_id: sessionId,
      attended: true,
    }))

    const { error: insertError } = await admin
      .from('class_attendance')
      .upsert(rows, { onConflict: 'child_id,session_id', ignoreDuplicates: true })

    if (insertError) {
      return NextResponse.json({ error: 'No pudimos guardar la asistencia' }, { status: 500 })
    }
  }

  // Total de sesiones que tiene el curso — denominador del % de avance del curso
  const { count: totalSessionsInCourse } = await admin
    .from('class_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', session.course_id)

  // Recalcula desde la fuente de verdad para cada niño afectado — tanto el
  // contador global (classes_completed, mueve la insignia) como el % del
  // curso específico (enrollments.progress, la barra de "Sus cursos").
  for (const childId of childIds) {
    const { count: totalCompleted } = await admin
      .from('class_attendance')
      .select('id', { count: 'exact', head: true })
      .eq('child_id', childId)

    await admin
      .from('children')
      .update({ classes_completed: totalCompleted ?? 0 })
      .eq('id', childId)

    const { data: sessionsForCourse } = await admin
      .from('class_sessions')
      .select('id')
      .eq('course_id', session.course_id)

    const sessionIdsInCourse = (sessionsForCourse ?? []).map((s) => s.id)

    const { count: attendedInCourse } =
      sessionIdsInCourse.length > 0
        ? await admin
            .from('class_attendance')
            .select('id', { count: 'exact', head: true })
            .eq('child_id', childId)
            .in('session_id', sessionIdsInCourse)
        : { count: 0 }

    const progress =
      totalSessionsInCourse && totalSessionsInCourse > 0
        ? Math.min(100, Math.round(((attendedInCourse ?? 0) / totalSessionsInCourse) * 100))
        : 0

    await admin
      .from('enrollments')
      .update({ progress })
      .eq('student_id', childId)
      .eq('course_id', session.course_id)
  }

  return NextResponse.json({ success: true })
}
