import { createServiceRoleClient } from './server'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'

export interface InstructorSessionRow {
  sessionId: string
  sessionTitle: string
  moduleTitle: string | null
  scheduledAt: string
  courseTitle: string
  googleMeetLink: string | null
  roster: {
    childId: string
    childName: string
    enrollmentStatus: 'pending_payment' | 'active' | 'completed' | 'dropped'
    alreadyMarked: boolean
  }[]
}

/**
 * Trae las próximas sesiones de los cursos de un profesor (courses.instructor_id),
 * con el roster completo (pagados y pendientes de pago) y si ya se marcó
 * asistencia. Solo se usa desde /profesor, con el rol ya verificado.
 *
 * Cruza todo manualmente en vez de usar embeds de PostgREST, mismo motivo
 * que en admin-queries.ts: la caché de relaciones no reconoce esos pares.
 */
export async function getUpcomingSessionsForInstructor(
  instructorId: string,
  daysAhead: number = 14
): Promise<InstructorSessionRow[]> {
  const supabase = createServiceRoleClient()

  const { data: myCourses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, curriculum_level_id')
    .eq('instructor_id', instructorId)

  if (coursesError) throw coursesError
  if (!myCourses || myCourses.length === 0) return []

  const courseIds = myCourses.map((c) => c.id)
  const courseTitleById = new Map(myCourses.map((c) => [c.id, c.title]))
  const courseLevelById = new Map(myCourses.map((c) => [c.id, c.curriculum_level_id]))

  const now = new Date()
  const rangeEnd = new Date(now)
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead)

  const { data: sessions, error: sessionsError } = await supabase
    .from('class_sessions')
    .select('id, title, scheduled_at, course_id, google_meet_link, module_number')
    .in('course_id', courseIds)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  if (sessionsError) throw sessionsError
  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map((s) => s.id)

  // enrollments y attendance no dependen entre sí — se piden en paralelo en
  // vez de uno tras otro para no sumar viajes de ida y vuelta innecesarios.
  const [
    { data: enrollments, error: enrollmentsError },
    { data: attendance, error: attendanceError },
  ] = await Promise.all([
    supabase
      .from('enrollments')
      .select('course_id, student_id, status')
      .in('course_id', courseIds)
      .in('status', ['active', 'pending_payment']),
    supabase.from('class_attendance').select('session_id, child_id').in('session_id', sessionIds),
  ])

  if (enrollmentsError) throw enrollmentsError
  if (attendanceError) throw attendanceError
  const markedSet = new Set((attendance ?? []).map((a) => `${a.session_id}_${a.child_id}`))

  const childIds = [...new Set((enrollments ?? []).map((e) => e.student_id))]
  const { data: children, error: childrenError } =
    childIds.length > 0
      ? await supabase.from('children').select('id, full_name').in('id', childIds)
      : { data: [], error: null }

  if (childrenError) throw childrenError
  const childById = new Map((children ?? []).map((c) => [c.id, c.full_name]))

  return sessions.map((session) => {
    const rosterForCourse = (enrollments ?? []).filter((e) => e.course_id === session.course_id)

    const courseLevel = CURRICULUM_LEVELS.find(
      (l) => l.id === courseLevelById.get(session.course_id)
    )

    return {
      sessionId: session.id,
      sessionTitle: session.title,
      moduleTitle:
        courseLevel?.modules.find((m) => m.number === session.module_number)?.title ?? null,
      scheduledAt: session.scheduled_at,
      courseTitle: courseTitleById.get(session.course_id) ?? '',
      googleMeetLink: session.google_meet_link,
      roster: rosterForCourse
        .filter((e) => childById.has(e.student_id))
        .map((e) => ({
          childId: e.student_id,
          childName: childById.get(e.student_id) as string,
          enrollmentStatus: e.status as 'pending_payment' | 'active' | 'completed' | 'dropped',
          alreadyMarked: markedSet.has(`${session.id}_${e.student_id}`),
        })),
    }
  })
}
