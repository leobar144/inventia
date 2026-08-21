import { createServiceRoleClient } from './server'
import { sortByPlanOrder } from '../plans'
import { computeCourseEconomics, type CourseEconomics } from '../economics'

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
  session_count: number
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

  const { data: sessions } = await supabase
    .from('class_sessions')
    .select('course_id')
    .in(
      'course_id',
      courses.map((c) => c.id)
    )

  const sessionCountByCourse = new Map<string, number>()
  for (const s of sessions ?? []) {
    sessionCountByCourse.set(s.course_id, (sessionCountByCourse.get(s.course_id) ?? 0) + 1)
  }

  return courses.map((c) => ({
    ...c,
    instructor_name: c.instructor_id ? (nameById.get(c.instructor_id) ?? null) : null,
    plan_prices: sortByPlanOrder(pricesByCourse.get(c.id) ?? []),
    session_count: sessionCountByCourse.get(c.id) ?? 0,
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

export interface CourseOccupancyRow {
  courseId: string
  courseTitle: string
  economics: CourseEconomics
}

/**
 * Ocupación y margen real de cada grupo.
 *
 * Es la métrica que faltaba: el costo del instructor ($160.000 por clase) no
 * cambia con cuántos niños haya, así que un grupo a media capacidad puede estar
 * perdiendo plata sin que nadie lo note hasta que el mes cierra mal.
 *
 * El aporte de cada niño sale de su plan real (precio ÷ clases que cubre), no
 * de un promedio: un niño de Semestre aporta menos por clase que uno de Mes.
 */
export async function getCourseOccupancy(): Promise<CourseOccupancyRow[]> {
  const supabase = createServiceRoleClient()

  const [{ data: courses }, { data: enrollments }, { data: planPrices }] = await Promise.all([
    supabase.from('courses').select('id, title, max_students').order('title'),
    supabase
      .from('enrollments')
      .select('course_id, plan_id, classes_purchased')
      .eq('status', 'active'),
    supabase.from('course_plan_prices').select('course_id, plan_id, price'),
  ])

  if (!courses) return []

  const priceByCoursePlan = new Map(
    (planPrices ?? []).map((p) => [`${p.course_id}_${p.plan_id}`, p.price])
  )

  const revenueByCourse = new Map<string, number[]>()
  for (const e of enrollments ?? []) {
    const price = priceByCoursePlan.get(`${e.course_id}_${e.plan_id}`)
    const classes = e.classes_purchased
    // Sin plan o sin precio no se puede calcular el aporte — cuenta como cero
    // para no inflar el margen con supuestos.
    const perClass = price && classes && classes > 0 ? price / classes : 0

    const list = revenueByCourse.get(e.course_id) ?? []
    list.push(perClass)
    revenueByCourse.set(e.course_id, list)
  }

  return courses.map((c) => ({
    courseId: c.id,
    courseTitle: c.title,
    economics: computeCourseEconomics(revenueByCourse.get(c.id) ?? [], c.max_students ?? 8),
  }))
}

export interface ChildOption {
  id: string
  full_name: string
  parent_name: string
  parent_email: string
}

/** Todos los niños registrados, con el nombre del acudiente, para el selector
 *  de pago manual en /admin/pagos. */
export async function getAllChildrenWithParent(): Promise<ChildOption[]> {
  const supabase = createServiceRoleClient()

  const { data: children, error } = await supabase
    .from('children')
    .select('id, full_name, parent_id')
    .order('full_name', { ascending: true })

  if (error) throw error
  if (!children || children.length === 0) return []

  const parentIds = [...new Set(children.map((c) => c.parent_id))]
  const { data: parents } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', parentIds)

  const parentById = new Map((parents ?? []).map((p) => [p.id, p]))

  return children.map((c) => {
    const parent = parentById.get(c.parent_id)
    return {
      id: c.id,
      full_name: c.full_name,
      parent_name: parent?.full_name || 'Sin nombre',
      parent_email: parent?.email || '',
    }
  })
}

export interface ManualPaymentRow {
  id: string
  reference: string
  amount: number
  method: string
  notes: string | null
  created_at: string
  child_name: string
  course_title: string
  recorded_by_name: string
}

/** Últimos pagos registrados a mano — el libro de caja de la academia. */
export async function getRecentManualPayments(limit = 25): Promise<ManualPaymentRow[]> {
  const supabase = createServiceRoleClient()

  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, reference, amount_in_cents, payment_method, notes, created_at, enrollment_id, recorded_by')
    .neq('payment_method', 'wompi')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  if (!payments || payments.length === 0) return []

  const enrollmentIds = payments.map((p) => p.enrollment_id).filter(Boolean)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, student_id, course_id')
    .in('id', enrollmentIds)

  const childIds = [...new Set((enrollments ?? []).map((e) => e.student_id))]
  const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id))]
  const adminIds = [...new Set(payments.map((p) => p.recorded_by).filter(Boolean))] as string[]

  const [{ data: children }, { data: courses }, { data: admins }] = await Promise.all([
    childIds.length > 0
      ? supabase.from('children').select('id, full_name').in('id', childIds)
      : Promise.resolve({ data: [] }),
    courseIds.length > 0
      ? supabase.from('courses').select('id, title').in('id', courseIds)
      : Promise.resolve({ data: [] }),
    adminIds.length > 0
      ? supabase.from('profiles').select('id, full_name').in('id', adminIds)
      : Promise.resolve({ data: [] }),
  ])

  const enrollmentById = new Map((enrollments ?? []).map((e) => [e.id, e]))
  const childNameById = new Map((children ?? []).map((c) => [c.id, c.full_name]))
  const courseTitleById = new Map((courses ?? []).map((c) => [c.id, c.title]))
  const adminNameById = new Map((admins ?? []).map((a) => [a.id, a.full_name]))

  return payments.map((p) => {
    const enrollment = enrollmentById.get(p.enrollment_id)
    return {
      id: p.id,
      reference: p.reference,
      amount: p.amount_in_cents / 100,
      method: p.payment_method,
      notes: p.notes,
      created_at: p.created_at,
      child_name: enrollment ? (childNameById.get(enrollment.student_id) ?? '—') : '—',
      course_title: enrollment ? (courseTitleById.get(enrollment.course_id) ?? '—') : '—',
      recorded_by_name: p.recorded_by ? (adminNameById.get(p.recorded_by) ?? '—') : '—',
    }
  })
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
