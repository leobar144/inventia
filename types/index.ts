// User Types
export type UserRole = 'student' | 'parent' | 'instructor' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  phone?: string
  created_at: string
  updated_at: string
}

// Course Types
export interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  image_url: string
  instructor_id: string
  start_date: string
  end_date: string
  schedule: string // e.g., "Mon-Wed 4:00 PM"
  max_students: number
  current_students: number
  price: number
  currency: 'COP' | 'USD'
  created_at: string
  updated_at: string
}

// Enrollment Types
export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_date: string
  completion_date?: string
  status: 'active' | 'completed' | 'dropped'
  progress: number // 0-100
}

// Class/Meeting Types
export interface ClassSession {
  id: string
  course_id: string
  title: string
  description: string
  scheduled_at: string
  duration_minutes: number
  google_meet_link: string
  recording_url?: string
  created_at: string
}

// Assignment Types
export interface Assignment {
  id: string
  course_id: string
  title: string
  description: string
  due_date: string
  created_at: string
}

// Submission Types
export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submission_url: string
  submitted_at: string
  status: 'submitted' | 'graded'
  grade?: number
  feedback?: string
}

// Certificate Types
export interface Certificate {
  id: string
  student_id: string
  course_id: string
  issued_date: string
  certificate_url: string
  verification_code: string
}
