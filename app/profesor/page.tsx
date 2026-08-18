import { createClient } from '@/lib/supabase/server'
import { getUpcomingSessionsForInstructor } from '@/lib/supabase/instructor-queries'
import InstructorSessionCard from '@/components/profesor/InstructorSessionCard'

export default async function ProfesorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const sessions = user ? await getUpcomingSessionsForInstructor(user.id, 14) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Mis clases</h1>
        <p className="text-gray-600">
          Próximas sesiones (14 días) — revisa el cuórum, el estado de pago y marca asistencia.
        </p>
      </div>

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
