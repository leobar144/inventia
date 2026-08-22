'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaTimes, FaWhatsapp, FaCalendarCheck } from 'react-icons/fa'
import { SITE_CONFIG, CAMPAIGN, isCampaignActive } from '@/lib/constants'
import PopupIllustration from './PopupIllustration'
import InventiaBot from './InventiaBot'

const STORAGE_KEY = 'inventia_welcome_popup_seen'

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Se muestra por INTENCIÓN, no por reloj.
   *
   * Antes saltaba a los 2,5 segundos, antes de que el visitante alcanzara a leer
   * nada — interrumpir a alguien que todavía no se enganchó es de los patrones
   * que más conversión destruyen. Ahora aparece cuando la persona ya demostró
   * interés (bajó más de la mitad de la página) o cuando está a punto de irse
   * (el cursor sale por arriba de la ventana).
   */
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const show = () => {
      setIsOpen(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
      cleanup()
    }

    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrolled > 0.5) show()
    }

    // Salida del cursor por el borde superior: la señal clásica de "me voy".
    // En móvil no existe, por eso el scroll es el disparador principal.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) show()
    }

    const cleanup = () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseout', onMouseOut)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseout', onMouseOut)

    return cleanup
  }, [])

  if (!isOpen) return null

  const campaignActive = isCampaignActive()
  const message = encodeURIComponent(
    campaignActive
      ? CAMPAIGN.whatsappMessage
      : '¡Hola INVENTIA! Quiero saber más sobre la clase de prueba gratis.'
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

        <div className="h-32 relative">
          <PopupIllustration />
          <InventiaBot className="w-24 h-24 absolute -bottom-6 right-4 animate-float drop-shadow-lg" />
        </div>

        <div className="p-6 text-center pt-2">
          <h3 className="text-secondary-800 text-xl font-heading font-bold leading-tight mb-3">
            Aprende creando.
            <br />
            Construye. Programa. Innova.
          </h3>
          <p className="text-lg font-bold text-gray-800 mb-1">
            La primera clase es gratis
          </p>
          <p className="text-gray-600 mb-4">
            Sin costo y sin compromiso. Tú ves si le gusta antes de decidir.
          </p>

          {campaignActive && (
            <div className="inline-flex items-center gap-2 border-2 border-dashed border-accent-400 bg-accent-50 text-accent-700 font-bold px-4 py-2 rounded-lg mb-4">
              🎉 {CAMPAIGN.name} · {CAMPAIGN.dateLabel}
            </div>
          )}

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
            Grupos de máximo 8 niños · 4 a 16 años · Bogotá, presencial o virtual
          </p>
        </div>
      </div>
    </div>
  )
}
