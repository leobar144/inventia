import { createClient } from './server'
import type { Child, Course, ClassSession, Enrollment, Payment } from '@/types'

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
