'use client'

import Link from 'next/link'
import { FaWhatsapp, FaVideo } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/constants'
import InventiaBot from './InventiaBot'
import CountdownTimer from './CountdownTimer'

interface BookingConfirmationCardProps {
  childName: string
  courseLabel: string
  dateLabel: string
  timeLabel: string
  targetDateTime: Date
  meetLink?: string
}

export default function BookingConfirmationCard({
  childName,
  courseLabel,
  dateLabel,
  timeLabel,
  targetDateTime,
  meetLink,
}: BookingConfirmationCardProps) {
  const whatsappMessage = encodeURIComponent(
    `Hola INVENTIA! Tengo una clase de prueba agendada para ${childName} el ${dateLabel} a las ${timeLabel}. Curso de interés: ${courseLabel}.`
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-16 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        <InventiaBot className="w-32 h-32 mx-auto mb-2 animate-float" />
        <h1 className="text-2xl font-heading font-bold mb-2">¡Clase de prueba agendada!</h1>
        <p className="text-gray-600 mb-1">
          <strong>{childName}</strong> tiene su clase el:
        </p>
        <p className="text-xl font-bold text-primary-600 mb-6 capitalize">
          {dateLabel} · {timeLabel}
        </p>

        <div className="bg-gray-50 rounded-xl py-4 mb-6">
          <CountdownTimer target={targetDateTime} />
        </div>

        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline w-full text-lg mb-3"
          >
            <FaVideo className="mr-2" size={18} /> Unirse a la videollamada
          </a>
        )}

        <a
          href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full text-lg mb-3"
        >
          <FaWhatsapp className="mr-2" size={20} /> Escribir por WhatsApp
        </a>
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
