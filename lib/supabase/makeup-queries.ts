import { createServiceRoleClient } from './server'
import { makeupAllowance, isWithinMakeupWindow, daysLeftToClaim } from '../makeup'

export interface MakeupSlot {
  sessionId: string
  title: string
  scheduledAt: string
  modality: 'presencial' | 'virtual'
  spotsLeft: number
}

export interface MissedClass {
  sessionId: string
  title: string
  courseId: string
  courseTitle: string
  scheduledAt: string
  daysLeft: number
  /** Si ya se agendó una reposición para esta clase. */
  bookedInto: { title: string; scheduledAt: string } | null
}

export interface MakeupInfo {
  missed: MissedClass[]
  /** Recuperaciones disponibles por curso: courseId → cuántas quedan. */
  remainingByCourse: Record<string, number>
  /** Horarios con cupo, por curso. */
  slotsByCourse: Record<string, MakeupSlot[]>
}

/**
 * Todo lo que el acudiente necesita para reponer una clase perdida.
 *
 * "Perdida" = sesión ya pasada de un curso en el que el niño está inscrito y
 * activo, sin registro de asistencia. No se deriva del "camino de clases"
 * porque ese usa estados done/next/locked, que responden otra pregunta.
 */
export async function getMakeupInfoForChild(
  childId: string,
  parentId: string
): Promise<MakeupInfo> {
  const empty: MakeupInfo = { missed: [], remainingByCourse: {}, slotsByCourse: {} }
  const admin = createServiceRoleClient()

  const [{ data: child }, { data: enrollments }] = await Promise.all([
    admin.from('children').select('id').eq('id', childId).eq('parent_id', parentId).maybeSingle(),
    admin
      .from('enrollments')
      .select('course_id, classes_purchased, status')
      .eq('student_id', childId)
      .eq('status', 'active'),
  ])

  if (!child || !enrollments || enrollments.length === 0) return empty

  const courseIds = enrollments.map((e) => e.course_id)
  const now = new Date()

  const [{ data: sessions }, { data: attendance }, { data: bookings }, { data: courses }] =
    await Promise.all([
      admin
        .from('class_sessions')
        .select('id, title, scheduled_at, course_id, modality')
        .in('course_id', courseIds)
        .order('scheduled_at', { ascending: true }),
      admin.from('class_attendance').select('session_id').eq('child_id', childId),
      admin
        .from('makeup_bookings')
        .select('missed_session_id, makeup_session_id, course_id')
        .eq('child_id', childId),
      admin.from('courses').select('id, title, max_students').in('id', courseIds),
    ])

  const attendedSet = new Set((attendance ?? []).map((a) => a.session_id))
  const bookedByMissed = new Map((bookings ?? []).map((b) => [b.missed_session_id, b]))
  const courseById = new Map((courses ?? []).map((c) => [c.id, c]))
  const sessionById = new Map((sessions ?? []).map((s) => [s.id, s]))

  // Cuántos niños ocupan ya cada sesión futura: los inscritos activos del curso
  // más las reposiciones que otras familias ya agendaron ahí.
  const { data: activeInCourses } = await admin
    .from('enrollments')
    .select('course_id')
    .in('course_id', courseIds)
    .eq('status', 'active')

  const activeCountByCourse = new Map<string, number>()
  for (const e of activeInCourses ?? []) {
    activeCountByCourse.set(e.course_id, (activeCountByCourse.get(e.course_id) ?? 0) + 1)
  }

  const futureSessionIds = (sessions ?? [])
    .filter((s) => new Date(s.scheduled_at) > now)
    .map((s) => s.id)

  const { data: allMakeups } =
    futureSessionIds.length > 0
      ? await admin
          .from('makeup_bookings')
          .select('makeup_session_id')
          .in('makeup_session_id', futureSessionIds)
      : { data: [] }

  const makeupCountBySession = new Map<string, number>()
  for (const m of allMakeups ?? []) {
    makeupCountBySession.set(
      m.makeup_session_id,
      (makeupCountBySession.get(m.makeup_session_id) ?? 0) + 1
    )
  }

  // --- Clases perdidas: pasadas, sin asistencia, dentro del plazo.
  const missed: MissedClass[] = []
  for (const session of sessions ?? []) {
    if (new Date(session.scheduled_at) > now) continue
    if (attendedSet.has(session.id)) continue
    if (!isWithinMakeupWindow(session.scheduled_at, now)) continue

    const booking = bookedByMissed.get(session.id)
    const makeupSession = booking ? sessionById.get(booking.makeup_session_id) : null

    missed.push({
      sessionId: session.id,
      title: session.title,
      courseId: session.course_id,
      courseTitle: courseById.get(session.course_id)?.title ?? '',
      scheduledAt: session.scheduled_at,
      daysLeft: daysLeftToClaim(session.scheduled_at, now),
      bookedInto: makeupSession
        ? { title: makeupSession.title, scheduledAt: makeupSession.scheduled_at }
        : null,
    })
  }

  // --- Cuántas recuperaciones le quedan en cada curso.
  const usedByCourse = new Map<string, number>()
  for (const b of bookings ?? []) {
    usedByCourse.set(b.course_id, (usedByCourse.get(b.course_id) ?? 0) + 1)
  }

  const remainingByCourse: Record<string, number> = {}
  for (const e of enrollments) {
    const allowance = makeupAllowance(e.classes_purchased)
    remainingByCourse[e.course_id] = Math.max(0, allowance - (usedByCourse.get(e.course_id) ?? 0))
  }

  // --- Horarios futuros con cupo real.
  const slotsByCourse: Record<string, MakeupSlot[]> = {}
  for (const session of sessions ?? []) {
    if (new Date(session.scheduled_at) <= now) continue

    const course = courseById.get(session.course_id)
    const maxStudents = course?.max_students ?? 8
    const occupied =
      (activeCountByCourse.get(session.course_id) ?? 0) +
      (makeupCountBySession.get(session.id) ?? 0)
    const spotsLeft = maxStudents - occupied

    if (spotsLeft <= 0) continue

    if (!slotsByCourse[session.course_id]) slotsByCourse[session.course_id] = []
    slotsByCourse[session.course_id].push({
      sessionId: session.id,
      title: session.title,
      scheduledAt: session.scheduled_at,
      modality: (session.modality as 'presencial' | 'virtual') ?? 'virtual',
      spotsLeft,
    })
  }

  return { missed, remainingByCourse, slotsByCourse }
}
