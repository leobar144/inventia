import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getBadgeProgress } from '@/lib/badges'
import { sendBadgeLevelUpEmail, sendRenewalAlertToParent, sendRenewalAlertToAdmin } from '@/lib/email'

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

  if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
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

  if (profile.role === 'instructor') {
    const { data: course } = await admin
      .from('courses')
      .select('instructor_id')
      .eq('id', session.course_id)
      .single()

    if (course?.instructor_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
  }

  const { data: course } = await admin
    .from('courses')
    .select('title')
    .eq('id', session.course_id)
    .single()
  const courseTitle = course?.title ?? 'su curso'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

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

  // Denominador de respaldo: total de sesiones del curso. Solo se usa para
  // inscripciones viejas que no registraron plan (anteriores a la migración 017).
  const { count: totalSessionsInCourse } = await admin
    .from('class_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', session.course_id)

  // Recalcula desde la fuente de verdad para cada niño afectado — tanto el
  // contador global (classes_completed, mueve la insignia) como el % del
  // curso específico (enrollments.progress, la barra de "Sus cursos").
  for (const childId of childIds) {
    const { data: child } = await admin
      .from('children')
      .select('full_name, classes_completed, parent_id')
      .eq('id', childId)
      .single()

    const previousBadge = getBadgeProgress(child?.classes_completed ?? 0)

    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id, renewal_alert_sent, classes_purchased')
      .eq('student_id', childId)
      .eq('course_id', session.course_id)
      .maybeSingle()

    // El avance se mide contra lo que la familia COMPRÓ (4, 12 o 24 clases), no
    // contra cuántas sesiones tenga el calendario del curso.
    const totalForProgress = enrollment?.classes_purchased ?? totalSessionsInCourse ?? 0

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
      totalForProgress > 0
        ? Math.min(100, Math.round(((attendedInCourse ?? 0) / totalForProgress) * 100))
        : 0

    await admin
      .from('enrollments')
      .update({ progress })
      .eq('student_id', childId)
      .eq('course_id', session.course_id)

    // Al llegar al 100% se marca completado (habilita el certificado de curso).
    // Solo se transiciona desde 'active' — nunca resucita un enrollment 'dropped'.
    if (progress === 100) {
      await admin
        .from('enrollments')
        .update({ status: 'completed', completion_date: new Date().toISOString() })
        .eq('student_id', childId)
        .eq('course_id', session.course_id)
        .eq('status', 'active')
    }

    // A partir de aquí, correo — nunca debe tumbar la respuesta si falla.
    if (child?.parent_id) {
      const { data: parentProfile } = await admin
        .from('profiles')
        .select('email, full_name')
        .eq('id', child.parent_id)
        .single()

      if (parentProfile?.email) {
        // Notificación de insignia nueva — solo si de verdad subió de nivel.
        const newBadge = getBadgeProgress(totalCompleted ?? 0)
        if (newBadge.current && newBadge.current.id !== previousBadge.current?.id) {
          await sendBadgeLevelUpEmail({
            parentEmail: parentProfile.email,
            parentName: parentProfile.full_name ?? 'Familia INVENTIA',
            childName: child.full_name,
            badgeIcon: newBadge.current.icon,
            badgeName: newBadge.current.name,
            unlocks: newBadge.current.unlocks,
            portalUrl: `${appUrl}/portal/hijos/${childId}`,
          }).catch(() => {})
        }

        // Alerta de renovación — solo una vez por inscripción, cuando quedan
        // pocas clases y el curso sigue activo (no si ya se completó).
        const classesRemaining = totalForProgress - (attendedInCourse ?? 0)
        if (classesRemaining > 0 && classesRemaining <= 2 && progress < 100) {
          if (enrollment && !enrollment.renewal_alert_sent) {
            await sendRenewalAlertToParent({
              parentEmail: parentProfile.email,
              parentName: parentProfile.full_name ?? 'Familia INVENTIA',
              childName: child.full_name,
              courseTitle,
              classesRemaining,
              portalUrl: `${appUrl}/portal/hijos/${childId}`,
            }).catch(() => {})

            await sendRenewalAlertToAdmin({
              childName: child.full_name,
              courseTitle,
              classesRemaining,
              parentName: parentProfile.full_name ?? 'Familia INVENTIA',
              parentEmail: parentProfile.email,
            }).catch(() => {})

            await admin.from('enrollments').update({ renewal_alert_sent: true }).eq('id', enrollment.id)
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true })
}
