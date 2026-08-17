'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaTimes, FaWhatsapp, FaCalendarCheck } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/constants'

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

        <div className="bg-gradient-to-br from-primary-600 to-secondary-700 px-6 py-8 text-center">
          <div className="text-5xl mb-3">🤖✨</div>
          <h3 className="text-white text-2xl font-heading font-bold leading-tight">
            Aprende creando.
            <br />
            Construye. Programa. Innova.
          </h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-lg font-bold text-gray-800 mb-1">
            Reserva un cupo en el Campamento STEM
          </p>
          <p className="text-gray-600 mb-4">5-12 de octubre · Cupos limitados</p>

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
            Sin compromiso · Respondemos en minutos · +100 niños ya han pasado por INVENTIA
          </p>
        </div>
      </div>
    </div>
  )
}
