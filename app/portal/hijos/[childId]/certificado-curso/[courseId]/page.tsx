import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getChildById, getEnrollmentsForChild } from '@/lib/supabase/portal-queries'
import CertificateCard from '@/components/CertificateCard'
import CertificatePrintButton from '@/components/CertificatePrintButton'

export default async function CertificadoCursoPage({
  params,
}: {
  params: Promise<{ childId: string; courseId: string }>
}) {
  const { childId, courseId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const child = await getChildById(childId, user.id)
  if (!child) notFound()

  const enrollments = await getEnrollmentsForChild(childId)
  const enrollment = enrollments.find((e) => e.course_id === courseId)
  if (!enrollment || enrollment.status !== 'completed') notFound()

  const dateLabel = new Date(enrollment.completion_date ?? enrollment.enrolled_date).toLocaleDateString(
    'es-CO',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div className="space-y-6">
      <div className="text-center no-print">
        <CertificatePrintButton />
      </div>
      <CertificateCard
        childName={child.full_name}
        achievementLabel="Ha completado el curso"
        achievementDetail={enrollment.course.title}
        dateLabel={dateLabel}
        certificateId={enrollment.id.slice(0, 8).toUpperCase()}
      />
    </div>
  )
}
