import { getAllCoursesWithInstructor, getAllInstructors } from '@/lib/supabase/admin-queries'
import { getPlan } from '@/lib/plans'
import CourseInstructorSelect from '@/components/admin/CourseInstructorSelect'
import CourseCurriculumSelect from '@/components/admin/CourseCurriculumSelect'
import NewCourseForm from '@/components/admin/NewCourseForm'
import NewSessionForm from '@/components/admin/NewSessionForm'
import InviteInstructorForm from '@/components/admin/InviteInstructorForm'

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
          <p className="text-gray-600">Invita profesores y asigna qué curso/clase dicta cada uno.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <InviteInstructorForm />
          <NewCourseForm instructors={instructors} />
          {courses.length > 0 && <NewSessionForm courses={courses} />}
        </div>
      </div>

      {instructors.length === 0 && (
        <div className="p-4 bg-accent-50 text-accent-800 rounded-lg text-sm">
          Todavía no tienes ningún profesor cargado. Usa "+ Invitar profesor" arriba — en
          cuanto acepte la invitación, va a aparecer disponible para asignarle cursos aquí mismo.
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-gray-600">No hay cursos creados todavía.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="card p-5 flex justify-between items-start flex-wrap gap-4">
              <div>
                <p className="font-bold">{course.title}</p>
                <p className="text-sm text-gray-500">
                  {course.schedule || 'Sin horario definido'}
                </p>
                {course.plan_prices.length === 0 ? (
                  <p className="text-sm text-accent-700 mt-1">
                    ⚠️ Sin planes con precio — no se puede inscribir todavía.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {course.plan_prices.map((pp) => (
                      <span
                        key={pp.plan_id}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {getPlan(pp.plan_id)?.name ?? pp.plan_id}: $
                        {pp.price.toLocaleString('es-CO')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <CourseInstructorSelect
                  courseId={course.id}
                  currentInstructorId={course.instructor_id}
                  instructors={instructors}
                />
                <CourseCurriculumSelect
                  courseId={course.id}
                  currentLevelId={course.curriculum_level_id}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
