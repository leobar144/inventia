import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'
import { getCourseWithSessions } from '@/lib/supabase/admin-queries'
import SessionRow from '@/components/admin/SessionRow'

export default async function AdminSesionesPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourseWithSessions(courseId)

  if (!course) notFound()

  const now = new Date()
  const upcoming = course.sessions.filter((s) => new Date(s.scheduledAt) > now)
  const past = course.sessions.filter((s) => new Date(s.scheduledAt) <= now)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/cursos"
          className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2"
        >
          <FaArrowLeft size={12} /> Cursos
        </Link>
        <h1 className="text-3xl font-heading font-bold">{course.title}</h1>
        <p className="text-gray-600">
          {course.sessions.length} clase{course.sessions.length === 1 ? '' : 's'} programada
          {course.sessions.length === 1 ? '' : 's'}
          {course.instructorName && ` · Profesor: ${course.instructorName}`}
        </p>
      </div>

      {course.sessions.length === 0 ? (
        <p className="text-gray-600">
          Este curso no tiene clases. Prográmalas desde{' '}
          <Link href="/admin/cursos" className="text-primary-600 hover:underline">
            Cursos
          </Link>{' '}
          con el botón de programar en lote.
        </p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">Próximas ({upcoming.length})</h2>
              <div className="space-y-2">
                {upcoming.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    curriculumLevelId={course.curriculumLevelId}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">Pasadas ({past.length})</h2>
              <p className="text-sm text-gray-500 mb-3">
                Las que ya tienen asistencia registrada no se pueden borrar — cambiarles la fecha es
                más seguro que eliminarlas.
              </p>
              <div className="space-y-2 opacity-75">
                {past.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    curriculumLevelId={course.curriculumLevelId}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
