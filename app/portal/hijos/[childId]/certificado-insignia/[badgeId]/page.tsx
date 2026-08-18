import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getChildById } from '@/lib/supabase/portal-queries'
import { BADGE_LEVELS } from '@/lib/badges'
import CertificateCard from '@/components/CertificateCard'
import CertificatePrintButton from '@/components/CertificatePrintButton'

export default async function CertificadoInsigniaPage({
  params,
}: {
  params: Promise<{ childId: string; badgeId: string }>
}) {
  const { childId, badgeId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const child = await getChildById(childId, user.id)
  if (!child) notFound()

  const level = BADGE_LEVELS.find((l) => l.id === badgeId)
  if (!level || child.classes_completed < level.threshold) notFound()

  const dateLabel = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="text-center no-print">
        <CertificatePrintButton />
      </div>
      <CertificateCard
        childName={child.full_name}
        achievementLabel="Ha alcanzado el nivel"
        achievementDetail={`${level.icon} ${level.name}`}
        dateLabel={dateLabel}
        certificateId={`${child.id.slice(0, 8).toUpperCase()}-${level.id.toUpperCase()}`}
      />
    </div>
  )
}
