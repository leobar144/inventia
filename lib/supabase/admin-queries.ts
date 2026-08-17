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
 *
 * Cruza todo manualmente en vez de usar embeds de PostgREST (course:courses(*))
 * porque la caché de relaciones no reconoce class_sessions -> courses.
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
    .select('id, title, scheduled_at, course_id')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  if (sessionsError) throw sessionsError
  if (!sessions || sessions.length === 0) return []

  const courseIds = [...new Set(sessions.map((s) => s.course_id))]

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title')
    .in('id', courseIds)

  if (coursesError) throw coursesError
  const courseTitleById = new Map((courses ?? []).map((c) => [c.id, c.title]))

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id, student_id')
    .in('course_id', courseIds)
    .eq('status', 'active')

  if (enrollmentsError) throw enrollmentsError

  const childIds = [...new Set((enrollments ?? []).map((e) => e.student_id))]
  const { data: children, error: childrenError } =
    childIds.length > 0
      ? await supabase.from('children').select('id, full_name').in('id', childIds)
      : { data: [], error: null }

  if (childrenError) throw childrenError
  const childById = new Map((children ?? []).map((c) => [c.id, c.full_name]))

  const sessionIds = sessions.map((s) => s.id)
  const { data: attendance, error: attendanceError } = await supabase
    .from('class_attendance')
    .select('session_id, child_id')
    .in('session_id', sessionIds)

  if (attendanceError) throw attendanceError

  const markedSet = new Set((attendance ?? []).map((a) => `${a.session_id}_${a.child_id}`))

  return sessions.map((session) => {
    const childIdsForCourse = (enrollments ?? [])
      .filter((e) => e.course_id === session.course_id)
      .map((e) => e.student_id)

    return {
      sessionId: session.id,
      sessionTitle: session.title,
      scheduledAt: session.scheduled_at,
      courseTitle: courseTitleById.get(session.course_id) ?? '',
      children: childIdsForCourse
        .filter((childId) => childById.has(childId))
        .map((childId) => ({
          childId,
          childName: childById.get(childId) as string,
          alreadyMarked: markedSet.has(`${session.id}_${childId}`),
        })),
    }
  })
}
