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

export async function getEnrollmentsForChild(childId: string): Promise<EnrollmentWithCourse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('student_id', childId)

  if (error) throw error
  return data as unknown as EnrollmentWithCourse[]
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
