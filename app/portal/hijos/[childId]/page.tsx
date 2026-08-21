import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, getCachedUser } from '@/lib/supabase/server'
import {
  getChildById,
  getEnrollmentsForChild,
  getClassPathForCourse,
  getClassNotesForChild,
  type SessionPathState,
} from '@/lib/supabase/portal-queries'
import { getBadgeProgress } from '@/lib/badges'
import { computeAttendanceStreak } from '@/lib/streak'
import BadgeIcon from '@/components/BadgeIcon'
import ClassPath from '@/components/portal/ClassPath'
import NextClassCard from '@/components/portal/NextClassCard'
import ShareProfileCard from '@/components/portal/ShareProfileCard'
import ClassDiary from '@/components/portal/ClassDiary'

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
  const {
    data: { user },
  } = await getCachedUser()

  if (!user) notFound()

  const supabase = await createClient()

  // Las tres consultas son independientes entre sí: ninguna necesita el
  // resultado de la otra. En cadena eran tres viajes Vercel→Supabase; así son
  // uno solo. La pertenencia se valida igual justo debajo.
  const [child, enrollments, classNotes] = await Promise.all([
    getChildById(childId, user.id),
    getEnrollmentsForChild(childId),
    getClassNotesForChild(childId, user.id),
  ])

  if (!child) notFound()

  // El camino de clases solo aplica a cursos ya pagados (activos o
  // completados) — un curso pendiente de pago todavía no tiene sesiones
  // que le correspondan al niño.
  const pathableEnrollments = enrollments.filter(
    (e) => e.status === 'active' || e.status === 'completed'
  )
  // El camino de clases, los cursos disponibles y sus precios tampoco dependen
  // entre sí — todo sale en la misma tanda.
  const enrolledCourseIds = enrollments.map((e) => e.course_id)
  const coursesQuery = supabase.from('courses').select('*')

  const [classPaths, { data: availableCourses }, { data: planPrices }] = await Promise.all([
    Promise.all(
      pathableEnrollments.map(async (e) => ({
        enrollment: e,
        path: await getClassPathForCourse(childId, e.course_id),
      }))
    ),
    enrolledCourseIds.length > 0
      ? coursesQuery.not('id', 'in', `(${enrolledCourseIds.join(',')})`)
      : coursesQuery,
    supabase.from('course_plan_prices').select('course_id, price').eq('is_active', true),
  ])

  const pathByEnrollmentId = new Map(classPaths.map((cp) => [cp.enrollment.id, cp.path]))

  // El precio de un curso ya no es un número único: depende del plan. Aquí solo
  // mostramos el punto de entrada ("desde $X") y el detalle vive en el checkout.
  const minPriceByCourse = new Map<string, number>()
  for (const row of planPrices ?? []) {
    const current = minPriceByCourse.get(row.course_id)
    if (current == null || row.price < current) minPriceByCourse.set(row.course_id, row.price)
  }

  // La próxima clase global: entre todos los cursos, la sesión "next" más próxima en el tiempo.
  let nextClass: {
    courseTitle: string
    sessionTitle: string
    moduleTitle: string | null
    scheduledAt: string
    googleMeetLink: string | null
    modality: 'presencial' | 'virtual'
  } | null = null

  for (const { enrollment, path } of classPaths) {
    const next = path.find((s: SessionPathState) => s.state === 'next')
    if (next && (!nextClass || next.scheduledAt < nextClass.scheduledAt)) {
      nextClass = {
        courseTitle: enrollment.course.title,
        sessionTitle: next.title,
        moduleTitle: next.moduleTitle,
        scheduledAt: next.scheduledAt,
        googleMeetLink: next.googleMeetLink,
        modality: next.modality,
      }
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold">
            {child.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">{child.full_name}</h1>
            <p className="text-gray-600">{calculateAge(child.birth_date)} años</p>
          </div>
        </div>
        <Link href={`/portal/hijos/${child.id}/aula`} className="btn btn-primary">
          🚀 Ir al Aula INVENTIA
        </Link>
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
              {badge.current && (
                <Link
                  href={`/portal/hijos/${child.id}/certificado-insignia/${badge.current.id}`}
                  className="inline-block mt-2 text-sm text-primary-600 font-medium hover:underline"
                >
                  Descargar certificado →
                </Link>
              )}
            </div>
          </section>
        )
      })()}

      {/* Próxima clase destacada */}
      <section>
        <h2 className="text-xl font-bold mb-4">Próxima clase</h2>
        <NextClassCard nextClass={nextClass} />
      </section>

      <ClassDiary
        childId={child.id}
        childName={child.full_name}
        entries={classNotes}
        photoConsent={child.photo_consent}
      />

      <ShareProfileCard
        childId={child.id}
        childName={child.full_name}
        isPublic={child.is_public}
        slug={child.public_slug}
      />

      {/* Cursos inscritos, con su camino de clases */}
      <section>
        <h2 className="text-xl font-bold mb-4">Sus cursos</h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-600">Todavía no está inscrito en ningún curso.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="card p-6">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <h3 className="font-bold">{enrollment.course.title}</h3>
                  <div className="flex items-center gap-2">
                    {pathByEnrollmentId.has(enrollment.id) &&
                      computeAttendanceStreak(pathByEnrollmentId.get(enrollment.id) ?? []) >= 2 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent-100 text-accent-700">
                          🔥 {computeAttendanceStreak(pathByEnrollmentId.get(enrollment.id) ?? [])} clases seguidas
                        </span>
                      )}
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
                </div>

                {pathByEnrollmentId.has(enrollment.id) ? (
                  <ClassPath sessions={pathByEnrollmentId.get(enrollment.id) ?? []} />
                ) : (
                  <p className="text-sm text-gray-500">
                    Las clases empiezan a verse aquí una vez se confirme el pago.
                  </p>
                )}

                {enrollment.status === 'completed' && (
                  <Link
                    href={`/portal/hijos/${child.id}/certificado-curso/${enrollment.course_id}`}
                    className="inline-block mt-3 text-sm text-primary-600 font-medium hover:underline"
                  >
                    Descargar certificado →
                  </Link>
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
                  {minPriceByCourse.has(course.id) && (
                    <p className="font-bold text-primary-600">
                      Desde ${minPriceByCourse.get(course.id)?.toLocaleString('es-CO')}{' '}
                      {course.currency}
                    </p>
                  )}
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
