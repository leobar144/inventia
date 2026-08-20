import { createServiceRoleClient } from './server'
import { sortByPlanOrder } from '../plans'

export interface CourseWithInstructor {
  id: string
  title: string
  description: string
  level: string
  /** @deprecated desde la migración 017 — el precio real está en plan_prices. */
  price: number
  currency: string
  schedule: string | null
  max_students: number | null
  instructor_id: string | null
  instructor_name: string | null
  curriculum_level_id: string | null
  plan_prices: { plan_id: string; price: number }[]
}

export interface InstructorOption {
  id: string
  full_name: string
  email: string
}

export interface AdminMetrics {
  revenueThisMonth: number
  revenueAllTime: number
  activeChildrenCount: number
  totalChildrenCount: number
  renewalCandidates: {
    childName: string
    courseTitle: string
    classesRemaining: number
    parentEmail: string
  }[]
}

/**
 * Métricas para /admin — ingresos, alumnos activos, y quién está por
 * terminar su plan (mismo cálculo que dispara la alerta de renovación
 * por correo, pero mostrado directo en el panel).
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createServiceRoleClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: paymentsThisMonth },
    { data: paymentsAllTime },
    { data: activeEnrollments },
    { count: totalChildrenCount },
  ] = await Promise.all([
    supabase
      .from('payments')
      .select('amount_in_cents')
      .eq('status', 'APPROVED')
      .gte('created_at', monthStart),
    supabase.from('payments').select('amount_in_cents').eq('status', 'APPROVED'),
    supabase
      .from('enrollments')
      .select('id, student_id, course_id, classes_purchased')
      .eq('status', 'active'),
    supabase.from('children').select('id', { count: 'exact', head: true }),
  ])

  const revenueThisMonth = (paymentsThisMonth ?? []).reduce((sum, p) => sum + p.amount_in_cents, 0) / 100
  const revenueAllTime = (paymentsAllTime ?? []).reduce((sum, p) => sum + p.amount_in_cents, 0) / 100
  const activeChildrenCount = new Set((activeEnrollments ?? []).map((e) => e.student_id)).size

  const renewalCandidates: AdminMetrics['renewalCandidates'] = []

  if (activeEnrollments && activeEnrollments.length > 0) {
    const courseIds = [...new Set(activeEnrollments.map((e) => e.course_id))]
    const childIds = [...new Set(activeEnrollments.map((e) => e.student_id))]

    const [
      { data: sessions },
      { data: children },
      { data: courses },
    ] = await Promise.all([
      supabase.from('class_sessions').select('id, course_id').in('course_id', courseIds),
      supabase.from('children').select('id, full_name, parent_id').in('id', childIds),
      supabase.from('courses').select('id, title').in('id', courseIds),
    ])

    const sessionIds = (sessions ?? []).map((s) => s.id)
    const { data: attendance } =
      sessionIds.length > 0
        ? await supabase
            .from('class_attendance')
            .select('session_id, child_id')
            .in('session_id', sessionIds)
            .in('child_id', childIds)
        : { data: [] }

    const childById = new Map((children ?? []).map((c) => [c.id, c]))
    const courseTitleById = new Map((courses ?? []).map((c) => [c.id, c.title]))
    const sessionCountByCourse = new Map<string, number>()
    for (const s of sessions ?? []) {
      sessionCountByCourse.set(s.course_id, (sessionCountByCourse.get(s.course_id) ?? 0) + 1)
    }
    const sessionCourseById = new Map((sessions ?? []).map((s) => [s.id, s.course_id]))

    const attendedCountByChildCourse = new Map<string, number>()
    for (const a of attendance ?? []) {
      const courseId = sessionCourseById.get(a.session_id)
      if (!courseId) continue
      const key = `${a.child_id}_${courseId}`
      attendedCountByChildCourse.set(key, (attendedCountByChildCourse.get(key) ?? 0) + 1)
    }

    const parentIds = [...new Set((children ?? []).map((c) => c.parent_id))]
    const { data: parents } =
      parentIds.length > 0
        ? await supabase.from('profiles').select('id, email').in('id', parentIds)
        : { data: [] }
    const parentEmailById = new Map((parents ?? []).map((p) => [p.id, p.email]))

    for (const enrollment of activeEnrollments) {
      // Se mide contra el plan comprado; el conteo de sesiones del curso solo es
      // respaldo para inscripciones anteriores a la migración 017.
      const total =
        enrollment.classes_purchased ?? sessionCountByCourse.get(enrollment.course_id) ?? 0
      const attended = attendedCountByChildCourse.get(`${enrollment.student_id}_${enrollment.course_id}`) ?? 0
      const classesRemaining = total - attended
      const child = childById.get(enrollment.student_id)

      if (total > 0 && classesRemaining > 0 && classesRemaining <= 2 && child) {
        renewalCandidates.push({
          childName: child.full_name,
          courseTitle: courseTitleById.get(enrollment.course_id) ?? '',
          classesRemaining,
          parentEmail: parentEmailById.get(child.parent_id) ?? '',
        })
      }
    }
  }

  return {
    revenueThisMonth,
    revenueAllTime,
    activeChildrenCount,
    totalChildrenCount: totalChildrenCount ?? 0,
    renewalCandidates,
  }
}

/**
 * Trae todos los cursos con el nombre del profesor asignado (si tiene).
 * Solo se usa desde /admin/cursos, con el rol admin ya verificado.
 */
export async function getAllCoursesWithInstructor(): Promise<CourseWithInstructor[]> {
  const supabase = createServiceRoleClient()

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(
      'id, title, description, level, price, currency, schedule, max_students, instructor_id, curriculum_level_id'
    )
    .order('title', { ascending: true })

  if (coursesError) throw coursesError
  if (!courses) return []

  const instructorIds = [...new Set(courses.map((c) => c.instructor_id).filter(Boolean))] as string[]
  const { data: instructors, error: instructorsError } =
    instructorIds.length > 0
      ? await supabase.from('profiles').select('id, full_name').in('id', instructorIds)
      : { data: [], error: null }

  if (instructorsError) throw instructorsError
  const nameById = new Map((instructors ?? []).map((i) => [i.id, i.full_name]))

  const { data: planPrices } = await supabase
    .from('course_plan_prices')
    .select('course_id, plan_id, price')
    .in(
      'course_id',
      courses.map((c) => c.id)
    )

  const pricesByCourse = new Map<string, { plan_id: string; price: number }[]>()
  for (const row of planPrices ?? []) {
    const list = pricesByCourse.get(row.course_id) ?? []
    list.push({ plan_id: row.plan_id, price: row.price })
    pricesByCourse.set(row.course_id, list)
  }

  return courses.map((c) => ({
    ...c,
    instructor_name: c.instructor_id ? (nameById.get(c.instructor_id) ?? null) : null,
    plan_prices: sortByPlanOrder(pricesByCourse.get(c.id) ?? []),
  }))
}

/**
 * Trae todos los perfiles con role='instructor', para el selector de
 * asignación de profesor en /admin/cursos.
 */
export async function getAllInstructors(): Promise<InstructorOption[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'instructor')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

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
