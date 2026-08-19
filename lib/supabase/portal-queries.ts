import { createClient, createServiceRoleClient } from './server'
import type { Child, Course, ClassSession, Enrollment, Payment } from '@/types'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'

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

  const { data: course, error: courseError } = await admin
    .from('courses')
    .select('curriculum_level_id')
    .eq('id', courseId)
    .single()

  if (courseError) throw courseError
  const curriculumLevel = CURRICULUM_LEVELS.find((l) => l.id === course?.curriculum_level_id)

  const { data: sessions, error } = await admin
    .from('class_sessions')
    .select('id, title, scheduled_at, google_meet_link, module_number')
    .eq('course_id', courseId)
    .order('scheduled_at', { ascending: true })

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
