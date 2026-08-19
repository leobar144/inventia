import { FaCalendarAlt, FaVideo, FaQuestionCircle } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/constants'

interface NextClassInfo {
  courseTitle: string
  sessionTitle: string
  moduleTitle: string | null
  scheduledAt: string
  googleMeetLink: string | null
}

export default function NextClassCard({ nextClass }: { nextClass: NextClassInfo | null }) {
  if (!nextClass) {
    return (
      <div className="card p-6 flex items-center gap-4">
        <FaCalendarAlt className="text-gray-300 text-2xl shrink-0" />
        <p className="text-gray-500 text-sm">No hay una próxima clase programada todavía.</p>
      </div>
    )
  }

  const dateLabel = new Date(nextClass.scheduledAt).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })

  const whatsappMessage = encodeURIComponent(
    `Hola INVENTIA! Necesito ayuda para conectarme a mi próxima clase (${nextClass.courseTitle}).`
  )

  return (
    <div className="rounded-2xl bg-primary-50 border border-primary-100 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
          <FaCalendarAlt className="text-primary-600" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary-700 font-medium capitalize">{dateLabel}</p>
          <p className="font-bold truncate">
            {nextClass.courseTitle} · {nextClass.sessionTitle}
          </p>
          {nextClass.moduleTitle && (
            <p className="text-xs text-gray-600 truncate">Van a ver: {nextClass.moduleTitle}</p>
          )}
        </div>
        {nextClass.googleMeetLink && (
          <a
            href={nextClass.googleMeetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-sm py-2 shrink-0"
          >
            <FaVideo className="mr-2" /> Unirse
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2.5">
        <FaQuestionCircle className="text-gray-400 shrink-0" size={14} />
        <span className="text-sm text-gray-600 flex-1">¿Problemas para conectarte?</span>
        <a
          href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 font-medium hover:underline"
        >
          Escríbenos →
        </a>
      </div>
    </div>
  )
}
