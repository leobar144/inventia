'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AGE_BANDS, CURSO_PADRES_NOMBRE } from '@/lib/protocolo'
import { SITE_CONFIG } from '@/lib/constants'

/**
 * Formulario de descarga de la guía.
 *
 * Las dos casillas van DESMARCADAS por defecto a propósito. Un consentimiento
 * premarcado no es un consentimiento, y una lista llena de gente que no pidió
 * que le escribieran es peor que una lista corta: esos mensajes terminan
 * reportados como spam en WhatsApp.
 */
export default function ProtocoloForm() {
  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [ageBand, setAgeBand] = useState('')
  const [wantsCourse, setWantsCourse] = useState(false)
  const [consent, setConsent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    // El canal de origen sale del enlace (?origen=instagram, ?origen=campamento).
    // Se lee al enviar y no con useSearchParams para no obligar a la página a
    // renderizarse del lado del cliente.
    const params = new URLSearchParams(window.location.search)
    const source = params.get('origen') ?? params.get('utm_source') ?? undefined

    const res = await fetch('/api/protocolo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        whatsapp,
        email,
        ageBand: ageBand || undefined,
        wantsCourse,
        source,
        consent,
      }),
    })

    setSaving(false)
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error || 'No pudimos enviar el formulario. Intente de nuevo.')
      return
    }

    setDownloadUrl(body.downloadUrl)
  }

  if (downloadUrl) {
    const firstName = fullName.trim().split(/\s+/)[0]
    return (
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">Listo, {firstName}</h2>
        <p className="text-gray-600 mb-6">Su guía está lista para descargar.</p>
        <a href={downloadUrl} download className="btn btn-primary w-full">
          Descargar el protocolo (PDF)
        </a>
        {wantsCourse && (
          <p className="text-sm text-gray-600 mt-5">
            Le escribiremos por WhatsApp apenas abra la preventa de «{CURSO_PADRES_NOMBRE}».
          </p>
        )}
        <p className="text-sm text-gray-500 mt-5">
          Mientras tanto, en Instagram publicamos ejemplos reales:{' '}
          <a
            href={SITE_CONFIG.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 font-medium hover:underline"
          >
            @inventiacol
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-4">
      <div>
        <h2 className="text-xl font-heading font-bold">Descargue la guía gratis</h2>
        <p className="text-sm text-gray-500">Le toma menos de un minuto.</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label htmlFor="protocolo-nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Su nombre
        </label>
        <input
          id="protocolo-nombre"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="protocolo-whatsapp"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            WhatsApp
          </label>
          <input
            id="protocolo-whatsapp"
            type="tel"
            required
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="input-field"
            placeholder="300 123 4567"
          />
        </div>
        <div>
          <label htmlFor="protocolo-correo" className="block text-sm font-medium text-gray-700 mb-1">
            Correo <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="protocolo-correo"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="protocolo-edades" className="block text-sm font-medium text-gray-700 mb-1">
          Edad de sus hijos <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select
          id="protocolo-edades"
          value={ageBand}
          onChange={(e) => setAgeBand(e.target.value)}
          className="input-field"
        >
          <option value="">Prefiero no decirlo</option>
          {AGE_BANDS.map((band) => (
            <option key={band.id} value={band.id}>
              {band.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={wantsCourse}
          onChange={(e) => setWantsCourse(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700 leading-snug">
          Avísenme cuando abra la preventa del curso en video «{CURSO_PADRES_NOMBRE}».
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-600 leading-snug">
          Autorizo a INVENTIA a enviarme esta guía y novedades de sus programas por WhatsApp y
          correo, y a tratar mis datos conforme a la{' '}
          <Link
            href="/privacidad"
            target="_blank"
            className="text-primary-600 font-medium hover:underline"
          >
            Política de Tratamiento de Datos
          </Link>
          . Puedo pedir que no me escriban más cuando quiera.
        </span>
      </label>

      <button
        type="submit"
        disabled={saving || !consent}
        className="btn btn-primary w-full disabled:opacity-40"
      >
        {saving ? 'Enviando…' : 'Quiero la guía'}
      </button>
    </form>
  )
}
