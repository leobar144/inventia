import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa'
import { createClient } from '@/lib/supabase/server'
import { getStudentsForCourse } from '@/lib/supabase/instructor-queries'

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  active: 'Activo',
  completed: 'Completado',
  dropped: 'Retirado',
}

export default async function ProfesorEstudiantesPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const data = await getStudentsForCourse(user.id, courseId)
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/profesor"
          className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2"
        >
          <FaArrowLeft size={12} /> Mis clases
        </Link>
        <h1 className="text-3xl font-heading font-bold">{data.courseTitle}</h1>
        <p className="text-gray-600">Historial de asistencia y avance de cada estudiante.</p>
      </div>

      {data.students.length === 0 ? (
        <p className="text-gray-600">Nadie inscrito en este curso todavía.</p>
      ) : data.sessions.length === 0 ? (
        <p className="text-gray-600">Este curso todavía no tiene clases programadas.</p>
      ) : (
        <div className="card p-4 overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 sticky left-0 bg-white">Estudiante</th>
                <th className="text-left py-2 pr-4">Estado</th>
                <th className="text-left py-2 pr-4">Avance</th>
                {data.sessions.map((session, i) => (
                  <th key={session.id} className="py-2 px-2 text-center font-normal">
                    <span className="block text-xs text-gray-500">Clase {i + 1}</span>
                    {session.moduleTitle && (
                      <span className="block text-[10px] text-gray-400 max-w-[80px] truncate" title={session.moduleTitle}>
                        {session.moduleTitle}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr key={student.childId} className="border-t border-gray-100">
                  <td className="py-3 pr-4 font-medium whitespace-nowrap sticky left-0 bg-white">
                    {student.childName}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        student.enrollmentStatus === 'active'
                          ? 'bg-primary-100 text-primary-700'
                          : student.enrollmentStatus === 'pending_payment'
                            ? 'bg-accent-100 text-accent-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[student.enrollmentStatus]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{student.progress}%</td>
                  {student.attendance.map((a) => (
                    <td key={a.sessionId} className="py-3 px-2 text-center">
                      {a.attended ? (
                        <FaCheck className="text-primary-500 mx-auto" size={13} />
                      ) : (
                        <FaTimes className="text-gray-300 mx-auto" size={13} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
