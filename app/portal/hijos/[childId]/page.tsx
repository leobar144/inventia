import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getChildById,
  getEnrollmentsForChild,
  getUpcomingSessionsForCourses,
} from '@/lib/supabase/portal-queries'
import { FaVideo, FaCalendarAlt } from 'react-icons/fa'
import { getBadgeProgress } from '@/lib/badges'
import BadgeIcon from '@/components/BadgeIcon'

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  active: 'Activo',
  completed: 'Completado',
  dropped: 'Retirado',
}

export default async function ChildDashboardPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const child = await getChildById(childId, user.id)
  if (!child) notFound()

  const enrollments = await getEnrollmentsForChild(childId)
  const activeCourseIds = enrollments
    .filter((e) => e.status === 'active')
    .map((e) => e.course_id)
  const upcomingSessions = await getUpcomingSessionsForCourses(activeCourseIds)

  const enrolledCourseIds = enrollments.map((e) => e.course_id)
  const coursesQuery = supabase.from('courses').select('*')
  const { data: availableCourses } =
    enrolledCourseIds.length > 0
      ? await coursesQuery.not('id', 'in', `(${enrolledCourseIds.join(',')})`)
      : await coursesQuery

  return (
    <div className="space-y-10">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold">
          {child.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">{child.full_name}</h1>
          <p className="text-gray-600">{calculateAge(child.birth_date)} años</p>
        </div>
      </div>

      {/* Insignia de nivel */}
      {(() => {
        const badge = getBadgeProgress(child.classes_completed)
        return (
          <section className="card p-6 flex items-center gap-5">
            {badge.current ? (
              <BadgeIcon level={badge.current} size="lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-4xl shrink-0">
                🌱
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">{child.classes_completed} clases completadas</p>
              <h2 className="text-xl font-bold">
                {badge.current ? badge.current.name : 'Aún sin insignia'}
              </h2>
              {badge.next && (
                <>
                  <p className="text-sm text-gray-600">
                    Le faltan <strong>{badge.classesUntilNext}</strong> clase
                    {badge.classesUntilNext !== 1 ? 's' : ''} para{' '}
                    <strong>
                      {badge.next.icon} {badge.next.name}
                    </strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Desbloquea: {badge.next.unlocks}
                  </p>
                </>
              )}
            </div>
          </section>
        )
      })()}

      {/* Cursos inscritos */}
      <section>
        <h2 className="text-xl font-bold mb-4">Sus cursos</h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-600">Todavía no está inscrito en ningún curso.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="card p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{enrollment.course.title}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      enrollment.status === 'active'
                        ? 'bg-primary-100 text-primary-700'
                        : enrollment.status === 'pending_payment'
                          ? 'bg-accent-100 text-accent-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABELS[enrollment.status]}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{enrollment.progress}% completado</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Próximas clases */}
      <section>
        <h2 className="text-xl font-bold mb-4">Próximas clases</h2>
        {upcomingSessions.length === 0 ? (
          <p className="text-gray-600">No hay clases programadas por ahora.</p>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="card p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="text-primary-500" />
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.scheduled_at).toLocaleString('es-CO', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
                {session.google_meet_link && (
                  <a
                    href={session.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary text-sm py-2"
                  >
                    <FaVideo className="mr-2" /> Unirse
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cursos disponibles para inscribir */}
      {availableCourses && availableCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Inscribir en un nuevo curso</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {availableCourses.map((course) => (
              <div key={course.id} className="card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <p className="font-bold text-primary-600">
                    ${course.price?.toLocaleString('es-CO')} {course.currency}
                  </p>
                </div>
                <Link
                  href={`/checkout/${course.id}?childId=${child.id}`}
                  className="btn btn-primary mt-4"
                >
                  Inscribir y pagar
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
