'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function InstitutionLeadForm() {
  const [institutionName, setInstitutionName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactRole, setContactRole] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [studentCount, setStudentCount] = useState('')
  const [grades, setGrades] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const res = await fetch('/api/school-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institutionName,
        contactName,
        contactRole,
        email,
        phone,
        studentCount: studentCount ? Number(studentCount) : null,
        grades,
        message,
        consent,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos enviar el mensaje. Intenta de nuevo.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <p className="text-5xl mb-4">🤖</p>
        <h3 className="text-2xl font-heading font-bold mb-2">¡Mensaje recibido!</h3>
        <p className="text-gray-600">
          Nos comunicamos con {institutionName} muy pronto para coordinar la demostración.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la institución
        </label>
        <input
          type="text"
          required
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          className="input-field"
          placeholder="Jardín Infantil..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Su nombre</label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
          <input
            type="text"
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
            className="input-field"
            placeholder="Directora, coordinadora..."
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="300 123 4567"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuántos estudiantes? (aprox.)
          </label>
          <input
            type="number"
            min={1}
            value={studentCount}
            onChange={(e) => setStudentCount(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">¿De qué edades?</label>
          <input
            type="text"
            value={grades}
            onChange={(e) => setGrades(e.target.value)}
            className="input-field"
            placeholder="Ej: prejardín y jardín, 4 y 5 años"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ¿Algo que debamos saber? (opcional)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field"
          placeholder="Horarios que les sirven, espacio disponible, fechas..."
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-600 leading-snug">
          Autorizo a INVENTIA a contactarme y a tratar mis datos conforme a la{' '}
          <Link
            href="/privacidad"
            target="_blank"
            className="text-primary-600 font-medium hover:underline"
          >
            Política de Tratamiento de Datos
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={saving || !consent}
        className="btn btn-primary w-full disabled:opacity-40"
      >
        {saving ? 'Enviando...' : 'Solicitar demostración'}
      </button>
    </form>
  )
}
