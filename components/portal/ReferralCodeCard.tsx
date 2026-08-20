'use client'

import { useState } from 'react'
import { FaCopy, FaCheck, FaWhatsapp } from 'react-icons/fa'

export default function ReferralCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Te quiero recomendar INVENTIA (robótica, programación e IA para niños). Cuando reserves tu clase de prueba gratis, usa mi código ${code}: https://inventiagroup.com/clase-de-prueba`
  )

  return (
    <div className="rounded-xl bg-secondary-900 text-white p-5 flex items-center justify-between flex-wrap gap-4">
      <div>
        <p className="text-sm text-secondary-300">🎁 Invita a otra familia</p>
        <p className="font-bold text-lg tracking-wide">{code}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="btn bg-white text-secondary-900 hover:bg-gray-100 text-sm py-2"
        >
          {copied ? <FaCheck className="mr-2" /> : <FaCopy className="mr-2" />}
          {copied ? 'Copiado' : 'Copiar código'}
        </button>
        <a
          href={`https://wa.me/?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary text-sm py-2"
        >
          <FaWhatsapp className="mr-2" /> Compartir
        </a>
      </div>
    </div>
  )
}
