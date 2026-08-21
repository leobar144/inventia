import { createClient, createServiceRoleClient } from './server'
import type { Child, Course, ClassSession, Enrollment, Payment, ChildProject } from '@/types'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'

export interface ClassNoteEntry {
  id: string
  note: string | null
  photoUrl: string | null
  sessionTitle: string
  courseTitle: string
  scheduledAt: string
}

/**
 * Bitácora de clases del niño: qué hizo en cada una, con foto si la hay.
 *
 * Las fotos viven en un bucket PRIVADO. Aquí se generan enlaces firmados que
 * expiran en una hora — nunca existe una URL permanente y abierta a la foto de
 * un menor. Por eso usa service role: firmar requiere esa llave.
 *
 * La pertenencia se verifica explícitamente contra parent_id, ya que el service
 * role se salta las políticas de RLS.
 */
export async function getClassNotesForChild(
  childId: string,
  parentId: string
): Promise<ClassNoteEntry[]> {
  const admin = createServiceRoleClient()

  // La verificación de pertenencia va en paralelo con la lectura de notas, no
  // antes: si el niño no es de este acudiente igual se descarta todo abajo, y
  // así se ahorra un viaje completo a la base.
  const [{ data: child }, { data: notes }] = await Promise.all([
    admin
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('parent_id', parentId)
      .maybeSingle(),
    admin
      .from('class_notes')
      .select('id, note, photo_path, session_id')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  if (!child) return []
  if (!notes || notes.length === 0) return []

  // Firmar las fotos solo depende de las notas, no de las sesiones — así que
  // ambas cosas se piden al tiempo en vez de una tras otra.
  const withPhotos = notes.filter((n) => n.photo_path)

  const [{ data: sessions }, signedResult] = await Promise.all([
    admin
      .from('class_sessions')
      .select('id, title, scheduled_at, course_id')
      .in(
        'id',
        notes.map((n) => n.session_id)
      ),
    withPhotos.length > 0
      ? admin.storage
          .from('class-evidence')
          .createSignedUrls(
            withPhotos.map((n) => n.photo_path as string),
            60 * 60
          )
      : Promise.resolve({ data: [] }),
  ])

  const signedByPath = new Map<string, string>()
  for (const item of signedResult.data ?? []) {
    if (item.signedUrl && item.path) signedByPath.set(item.path, item.signedUrl)
  }

  const sessionById = new Map((sessions ?? []).map((s) => [s.id, s]))
  const courseIds = [...new Set((sessions ?? []).map((s) => s.course_id))]
  const { data: courses } =
    courseIds.length > 0
      ? await admin.from('courses').select('id, title').in('id', courseIds)
      : { data: [] }
  const courseTitleById = new Map((courses ?? []).map((c) => [c.id, c.title]))

  return notes
    .map((n) => {
      const session = sessionById.get(n.session_id)
      return {
        id: n.id,
        note: n.note,
        photoUrl: n.photo_path ? (signedByPath.get(n.photo_path) ?? null) : null,
        sessionTitle: session?.title ?? '',
        courseTitle: session ? (courseTitleById.get(session.course_id) ?? '') : '',
        scheduledAt: session?.scheduled_at ?? '',
      }
    })
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
}

export async function getProjectsForChild(childId: string): Promise<ChildProject[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('child_projects')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/** Los niveles del currículo (lib/curriculum.ts) en los que el niño está activo o completado — para filtrar el Aula por lo que de verdad está estudiando. */
export async function getActiveCurriculumLevelsForChild(childId: string): Promise<string[]> {
  const enrollments = await getEnrollmentsForChild(childId)
  const levelIds = enrollments
    .filter((e) => e.status === 'active' || e.status === 'completed')
    .map((e) => e.course.curriculum_level_id)
    .filter((id): id is string => Boolean(id))
  return [...new Set(levelIds)]
}

export async function getChildrenForParent(parentId: string): Promise<Child[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Course
}

// No usa el embed course:courses(*) porque la caché de relaciones de PostgREST
// no reconoce enrollments -> courses en este proyecto; se cruza a mano.
export async function getEnrollmentsForChild(childId: string): Promise<EnrollmentWithCourse[]> {
  const supabase = await createClient()
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', childId)

  if (error) throw error
  if (!enrollments || enrollments.length === 0) return []

  const courseIds = [...new Set(enrollments.map((e) => e.course_id))]
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds)

  if (coursesError) throw coursesError
  const courseById = new Map((courses ?? []).map((c) => [c.id, c]))

  return enrollments
    .filter((e) => courseById.has(e.course_id))
    .map((e) => ({ ...e, course: courseById.get(e.course_id) as Course }))
}

export async function getUpcomingSessionsForCourses(
  courseIds: string[]
): Promise<ClassSession[]> {
  if (courseIds.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*')
    .in('course_id', courseIds)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data
}

export interface SessionPathState {
  id: string
  title: string
  moduleTitle: string | null
  scheduledAt: string
  googleMeetLink: string | null
  modality: 'presencial' | 'virtual'
  state: 'done' | 'next' | 'locked'
}

/**
 * El "camino de clases" de un curso para un niño: cada sesión marcada como
 * completada (ya asistió), la próxima (siguiente sin asistencia, destacada)
 * o bloqueada (futuras, todavía no le toca).
 *
 * Si el curso tiene curriculum_level_id y la sesión tiene module_number
 * (ver 008_curriculo_sesiones.sql), resuelve el nombre real del módulo del
 * Método CREA (lib/curriculum.ts) — si no, moduleTitle queda en null y el
 * componente muestra "Clase N" genérico.
 *
 * Usa service role porque class_attendance no tiene policy de select para
 * el rol autenticado normal (a propósito, ver 006_asistencia_insignias.sql
 * — solo se lee/escribe desde rutas del servidor ya verificadas). Es seguro
 * llamarla aquí porque quien la invoca ya confirmó con getChildById que el
 * niño pertenece al padre logueado.
 */
export async function getClassPathForCourse(
  childId: string,
  courseId: string
): Promise<SessionPathState[]> {
  const admin = createServiceRoleClient()

  // El curso (para el nivel del currículo) y las sesiones no dependen entre
  // sí — se piden en paralelo en vez de uno tras otro.
  const [
    { data: course, error: courseError },
    { data: sessions, error },
  ] = await Promise.all([
    admin.from('courses').select('curriculum_level_id').eq('id', courseId).single(),
    admin
      .from('class_sessions')
      .select('id, title, scheduled_at, google_meet_link, module_number, modality')
      .eq('course_id', courseId)
      .order('scheduled_at', { ascending: true }),
  ])

  if (courseError) throw courseError
  const curriculumLevel = CURRICULUM_LEVELS.find((l) => l.id === course?.curriculum_level_id)

  if (error) throw error
  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map((s) => s.id)
  const { data: attendance, error: attendanceError } = await admin
    .from('class_attendance')
    .select('session_id')
    .eq('child_id', childId)
    .in('session_id', sessionIds)

  if (attendanceError) throw attendanceError
  const attendedSet = new Set((attendance ?? []).map((a) => a.session_id))

  const firstUnattendedIndex = sessions.findIndex((s) => !attendedSet.has(s.id))

  return sessions.map((s, i) => ({
    id: s.id,
    title: s.title,
    moduleTitle:
      curriculumLevel?.modules.find((m) => m.number === s.module_number)?.title ?? null,
    scheduledAt: s.scheduled_at,
    googleMeetLink: s.google_meet_link,
    modality: (s.modality as 'presencial' | 'virtual') ?? 'virtual',
    state: attendedSet.has(s.id) ? 'done' : i === firstUnattendedIndex ? 'next' : 'locked',
  }))
}

export async function getChildById(childId: string, parentId: string): Promise<Child | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('parent_id', parentId)
    .single()

  if (error) return null
  return data
}

export async function getPaymentsForParent(parentId: string): Promise<Payment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
