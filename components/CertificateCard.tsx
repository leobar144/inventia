import Image from 'next/image'

export default function CertificateCard({
  childName,
  achievementLabel,
  achievementDetail,
  dateLabel,
  certificateId,
}: {
  childName: string
  achievementLabel: string
  achievementDetail: string
  dateLabel: string
  certificateId: string
}) {
  return (
    <div className="max-w-3xl mx-auto border-8 border-double border-primary-600 rounded-2xl p-12 text-center bg-white">
      <div className="relative h-16 w-56 mx-auto mb-6">
        <Image src="/logo2.jpeg" alt="INVENTIA" fill className="object-contain" />
      </div>

      <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Certificado de logro</p>
      <p className="text-lg text-gray-600 mb-1">Se otorga el presente certificado a</p>
      <h1 className="text-4xl font-heading font-bold text-secondary-900 my-4">{childName}</h1>
      <p className="text-lg text-gray-600 mb-1">{achievementLabel}</p>
      <p className="text-2xl font-bold text-primary-600 mb-8">{achievementDetail}</p>

      <div className="flex justify-between items-end mt-16 text-sm text-gray-500">
        <div>
          <p className="border-t border-gray-400 pt-2 px-6">{dateLabel}</p>
          <p className="text-xs">Fecha</p>
        </div>
        <div>
          <p className="border-t border-gray-400 pt-2 px-6">INVENTIA</p>
          <p className="text-xs">Tu hijo no usa tecnología. La inventa.</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">Certificado #{certificateId}</p>
    </div>
  )
}
