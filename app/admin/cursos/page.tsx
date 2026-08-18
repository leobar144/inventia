import { getAllCoursesWithInstructor, getAllInstructors } from '@/lib/supabase/admin-queries'
import CourseInstructorSelect from '@/components/admin/CourseInstructorSelect'
import NewCourseForm from '@/components/admin/NewCourseForm'

export default async function AdminCursosPage() {
  const [courses, instructors] = await Promise.all([
    getAllCoursesWithInstructor(),
    getAllInstructors(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Cursos y profesores</h1>
          <p className="text-gray-600">Asigna qué profesor dicta cada curso/clase.</p>
        </div>
        <NewCourseForm instructors={instructors} />
      </div>

      {instructors.length === 0 && (
        <div className="p-4 bg-accent-50 text-accent-800 rounded-lg text-sm">
          Todavía no tienes ningún profesor registrado. Un profesor primero debe crear su cuenta
          en <code>/registro</code>, y luego cambiar su <code>role</code> a{' '}
          <code>instructor</code> en Supabase → tabla <code>profiles</code>.
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-gray-600">No hay cursos creados todavía.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="card p-5 flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="font-bold">{course.title}</p>
                <p className="text-sm text-gray-500">
                  {course.schedule || 'Sin horario definido'} · $
                  {course.price.toLocaleString('es-CO')} {course.currency}
                </p>
              </div>
              <CourseInstructorSelect
                courseId={course.id}
                currentInstructorId={course.instructor_id}
                instructors={instructors}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
