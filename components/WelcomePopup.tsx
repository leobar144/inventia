'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaTimes, FaWhatsapp, FaCalendarCheck } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/constants'
import PopupIllustration from './PopupIllustration'

const STORAGE_KEY = 'inventia_welcome_popup_seen'

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(STORAGE_KEY)
    if (alreadySeen) return

    const timer = setTimeout(() => {
      setIsOpen(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!isOpen) return null

  const message = encodeURIComponent(
    'Hola INVENTIA! Quiero reservar un cupo para el campamento de octubre.'
  )
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${message}`

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-600 shadow"
        >
          <FaTimes />
        </button>

        <div className="h-40 relative">
          <PopupIllustration />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <h3 className="text-white text-xl sm:text-2xl font-heading font-bold leading-tight text-center drop-shadow">
              Aprende creando.
              <br />
              Construye. Programa. Innova.
            </h3>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-lg font-bold text-gray-800 mb-1">
            Reserva un cupo en el Campamento STEM
          </p>
          <p className="text-gray-600 mb-3">5-12 de octubre · Cupos limitados</p>

          <div className="inline-flex items-center gap-2 border-2 border-dashed border-accent-400 bg-accent-50 text-accent-700 font-bold px-4 py-2 rounded-lg mb-4">
            🎉 30% OFF en el Campamento STEM
          </div>

          <Link
            href="/clase-de-prueba"
            onClick={() => setIsOpen(false)}
            className="btn btn-primary w-full text-lg mb-3"
          >
            <FaCalendarCheck className="mr-2" size={18} /> Agendar clase de prueba gratis
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="btn btn-outline w-full text-sm"
          >
            <FaWhatsapp className="mr-2" /> O escríbenos por WhatsApp
          </a>

          <p className="text-xs text-gray-500 mt-4">
            Menciona esta promoción al escribirnos · Sin compromiso · Respondemos en minutos
          </p>
        </div>
      </div>
    </div>
  )
}
