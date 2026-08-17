import { createServiceRoleClient } from './server'

export interface SessionAttendanceRow {
  sessionId: string
  sessionTitle: string
  scheduledAt: string
  courseTitle: string
  children: {
    childId: string
    childName: string
    alreadyMarked: boolean
  }[]
}

/**
 * Trae las próximas sesiones de clase junto con los niños actualmente
 * inscritos (activos) en ese curso, y si ya se marcó su asistencia.
 * Solo se usa desde /admin/asistencia, con el rol admin ya verificado.
 */
export async function getUpcomingSessionsWithAttendance(
  daysAhead: number = 14
): Promise<SessionAttendanceRow[]> {
  const supabase = createServiceRoleClient()

  const now = new Date()
  const rangeEnd = new Date(now)
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead)

  const { data: sessions, error: sessionsError } = await supabase
    .from('class_sessions')
    .select('id, title, scheduled_at, course_id, courses(title)')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  if (sessionsError) throw sessionsError
  if (!sessions || sessions.length === 0) return []

  const courseIds = [...new Set(sessions.map((s) => s.course_id))]

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id, children(id, full_name)')
    .in('course_id', courseIds)
    .eq('status', 'active')

  if (enrollmentsError) throw enrollmentsError

  const sessionIds = sessions.map((s) => s.id)
  const { data: attendance, error: attendanceError } = await supabase
    .from('class_attendance')
    .select('session_id, child_id')
    .in('session_id', sessionIds)

  if (attendanceError) throw attendanceError

  const markedSet = new Set((attendance ?? []).map((a) => `${a.session_id}_${a.child_id}`))

  return sessions.map((session) => {
    const childrenForCourse = (enrollments ?? [])
      .filter((e) => e.course_id === session.course_id)
      .map((e) => e.children as unknown as { id: string; full_name: string } | null)
      .filter((c): c is { id: string; full_name: string } => c !== null)

    return {
      sessionId: session.id,
      sessionTitle: session.title,
      scheduledAt: session.scheduled_at,
      courseTitle: (session.courses as unknown as { title: string } | null)?.title ?? '',
      children: childrenForCourse.map((child) => ({
        childId: child.id,
        childName: child.full_name,
        alreadyMarked: markedSet.has(`${session.id}_${child.id}`),
      })),
    }
  })
}
