'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InviteInstructorForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    const res = await fetch('/api/admin/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email }),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos invitar al profesor.')
      return
    }

    setFullName('')
    setEmail('')
    setSuccess(true)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-outline">
        + Invitar profesor
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-md">
      <h2 className="text-lg font-bold">Invitar profesor</h2>
      <p className="text-sm text-gray-600">
        Le llega un correo para crear su contraseña. En cuanto acepte, aparece disponible para
        asignarle cursos aquí mismo.
      </p>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && (
        <div className="p-3 bg-primary-50 text-primary-700 rounded-lg text-sm">
          Invitación enviada.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-field"
        />
      </div>

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

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Enviando...' : 'Enviar invitación'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
          Cerrar
        </button>
      </div>
    </form>
  )
}
