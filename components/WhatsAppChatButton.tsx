'use client'

import { useState } from 'react'
import { FaWhatsapp, FaTimes } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/constants'
import InventiaBot from './InventiaBot'

export default function WhatsAppChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  const message = encodeURIComponent(
    'Hola INVENTIA! Tengo una pregunta sobre los cursos.'
  )
  const chatUrl = `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${message}`

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
          <div className="bg-primary-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
                <InventiaBot className="w-9 h-9" />
              </div>
              <div>
                <p className="font-bold text-sm">INVENTIA</p>
                <p className="text-xs text-primary-100">Normalmente responde en minutos</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              className="text-white/80 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          <div className="p-4 bg-gray-50">
            <div className="bg-white rounded-lg p-3 text-sm text-gray-700 shadow-sm mb-3">
              ¡Hola! 👋 ¿Tienes preguntas sobre nuestros cursos de robótica, programación o IA?
              Escríbenos y te respondemos por WhatsApp.
            </div>
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full text-sm"
            >
              <FaWhatsapp className="mr-2" /> Iniciar conversación
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar chat de soporte' : 'Abrir chat de soporte'}
        className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        {isOpen ? <FaTimes size={22} /> : <FaWhatsapp size={26} />}
      </button>
    </div>
  )
}
