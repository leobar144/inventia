'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaWhatsapp, FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa'

export default function ShareProfileCard({
  childId,
  childName,
  isPublic: initialIsPublic,
  slug: initialSlug,
}: {
  childId: string
  childName: string
  isPublic: boolean
  slug: string | null
}) {
  const router = useRouter()
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [slug, setSlug] = useState(initialSlug)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = childName.trim().split(/\s+/)[0]
  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${slug}` : ''

  const handleToggle = async () => {
    const next = !isPublic
    setSaving(true)
    setError(null)

    const res = await fetch('/api/portal/child-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, isPublic: next }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('No pudimos guardar el cambio. Intenta de nuevo.')
      return
    }

    const body = await res.json()
    setIsPublic(body.isPublic)
    setSlug(body.slug)
    router.refresh()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappText = encodeURIComponent(
    `Miren lo que ha construido ${firstName} en INVENTIA 🚀\n\n${publicUrl}`
  )

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold">Compartir sus logros</h2>
          <p className="text-sm text-gray-600 max-w-md">
            Crea un enlace para mostrarle a la familia lo que {firstName} ha construido. Tú
            decides, y puedes desactivarlo cuando quieras.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-label="Activar perfil público"
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            isPublic ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {isPublic && slug ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
            <code className="text-xs text-gray-600 truncate flex-1">{publicUrl}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="text-primary-600 hover:text-primary-700 shrink-0"
              aria-label="Copiar enlace"
            >
              {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-sm"
            >
              <FaWhatsapp className="mr-2" /> Compartir por WhatsApp
            </a>
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-sm"
            >
              Ver cómo se ve <FaExternalLinkAlt className="ml-2" size={11} />
            </a>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
            <p>
              <strong>Se muestra:</strong> su nombre de pila, su insignia, cuántas clases lleva y
              los proyectos que hayas agregado.
            </p>
            <p>
              <strong>Nunca se muestra:</strong> su apellido, su fecha de nacimiento, tus datos de
              contacto ni información de pagos.
            </p>
            <p>La página no aparece en buscadores. Solo llega quien tenga el enlace.</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-4">
          Está desactivado. El perfil de {firstName} no es visible para nadie fuera de tu cuenta.
        </p>
      )}
    </section>
  )
}
