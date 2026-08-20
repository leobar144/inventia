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

// Child Types — a student profile owned by a parent account (no login of its own)
export interface Child {
  id: string
  parent_id: string
  full_name: string
  birth_date: string
  avatar_url?: string
  classes_completed: number
  created_at: string
  /** Autorización del acudiente para mostrar el perfil público. Apagado por defecto. */
  is_public: boolean
  /** Token del enlace público. Null hasta que se activa por primera vez. */
  public_slug: string | null
}

export interface ClassAttendance {
  id: string
  child_id: string
  session_id: string
  attended: boolean
  created_at: string
}

export interface ChildProject {
  id: string
  child_id: string
  title: string
  url: string
  created_at: string
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
  curriculum_level_id: string | null
  created_at: string
  updated_at: string
}

// Enrollment Types
export interface Enrollment {
  id: string
  student_id: string // references children(id), not profiles(id)
  course_id: string
  enrolled_date: string
  completion_date?: string
  status: 'pending_payment' | 'active' | 'completed' | 'dropped'
  progress: number // 0-100
  plan_id: string | null // 'mes' | 'trimestre' | 'semestre'
  classes_purchased: number | null // denominador del avance
}

/** Precio de una combinación curso × plan. Fuente de verdad de lo que se cobra. */
export interface CoursePlanPrice {
  id: string
  course_id: string
  plan_id: string
  price: number
  is_active: boolean
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

// Payment Types (Wompi)
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export interface Payment {
  id: string
  enrollment_id: string
  parent_id: string
  wompi_transaction_id?: string
  reference: string
  amount_in_cents: number
  currency: 'COP'
  status: PaymentStatus
  raw_response?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Trial Class Booking Types
export interface TrialAvailability {
  id: string
  day_of_week: number // 0 = domingo ... 6 = sábado
  time: string // 'HH:MM:SS'
  is_active: boolean
}

export interface TrialBookingInput {
  availabilityId: string
  bookingDate: string // 'YYYY-MM-DD'
  childName: string
  childAge: number
  courseInterest: string
  parentName: string
  whatsapp: string
  parentEmail: string
  referredByCode?: string
  dataConsent?: boolean
  dataConsentVersion?: string
}

export interface AvailableSlotDay {
  date: string // 'YYYY-MM-DD'
  slots: { availabilityId: string; time: string }[]
}
