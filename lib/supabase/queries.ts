import { createClient } from './server'
import type { Course, ClassSession } from '@/types'

export async function getCourses(limit: number = 10, offset: number = 0): Promise<Course[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getCourseById(id: string): Promise<Course> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getCourseSessions(courseId: string): Promise<ClassSession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*')
    .eq('course_id', courseId)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data
}
