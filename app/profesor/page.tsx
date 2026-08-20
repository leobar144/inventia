import Link from 'next/link'
import { FaUsers } from 'react-icons/fa'
import { createClient } from '@/lib/supabase/server'
import {
  getUpcomingSessionsForInstructor,
  getCoursesForInstructor,
} from '@/lib/supabase/instructor-queries'
import InstructorSessionCard from '@/components/profesor/InstructorSessionCard'

export default async function ProfesorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [sessions, courses] = user
    ? await Promise.all([
        getUpcomingSessionsForInstructor(user.id, 14),
        getCoursesForInstructor(user.id),
      ])
    : [[], []]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Mis clases</h1>
        <p className="text-gray-600">
          Próximas sesiones (14 días) — revisa el cuórum, el estado de pago y marca asistencia.
        </p>
      </div>

      {courses.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/profesor/cursos/${course.id}/estudiantes`}
              className="btn btn-outline text-sm py-2"
            >
              <FaUsers className="mr-2" /> Ver estudiantes de {course.title}
            </Link>
          ))}
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-600">
          No tienes sesiones de clase programadas en los próximos 14 días.
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <InstructorSessionCard key={session.sessionId} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
