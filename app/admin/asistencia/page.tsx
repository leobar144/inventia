import { getUpcomingSessionsWithAttendance } from '@/lib/supabase/admin-queries'
import AttendanceSessionCard from '@/components/admin/AttendanceSessionCard'

export default async function AdminAsistenciaPage() {
  const sessions = await getUpcomingSessionsWithAttendance(14)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Marcar asistencia</h1>
        <p className="text-gray-600">Próximas sesiones (14 días) — marca quién asistió</p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-600">No hay sesiones de clase programadas en los próximos 14 días.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <AttendanceSessionCard key={session.sessionId} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
