'use client'

import { useState } from 'react'
import { FaCamera, FaCheck } from 'react-icons/fa'

export default function ClassNoteEditor({
  childId,
  childName,
  sessionId,
  initialNote,
  hasPhoto: initialHasPhoto,
  photoConsent,
}: {
  childId: string
  childName: string
  sessionId: string
  initialNote: string | null
  hasPhoto: boolean
  photoConsent: boolean
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(initialNote ?? '')
  const [photo, setPhoto] = useState<File | null>(null)
  const [hasPhoto, setHasPhoto] = useState(initialHasPhoto)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = childName.trim().split(/\s+/)[0]

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const formData = new FormData()
    formData.append('childId', childId)
    formData.append('sessionId', sessionId)
    formData.append('note', note)
    if (photo) formData.append('photo', photo)

    const res = await fetch('/api/admin/class-notes', { method: 'POST', body: formData })
    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos guardar.')
      return
    }

    const body = await res.json()
    setHasPhoto(body.hasPhoto)
    setPhoto(null)
    setSaved(true)
  }

  const hasContent = Boolean(initialNote) || initialHasPhoto

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs font-medium ${
          hasContent ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'
        }`}
      >
        {hasContent ? '📝 Editar' : '+ Nota'}
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-200 p-3 space-y-2">
      <p className="text-xs font-medium text-gray-700">¿Qué hizo {firstName} hoy?</p>

      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          setSaved(false)
        }}
        rows={2}
        maxLength={280}
        className="input-field text-sm"
        placeholder="Ej: Programó su primer juego de laberinto y lo hizo funcionar solo."
      />

      {photoConsent ? (
        <div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <FaCamera />
            <span>
              {photo ? photo.name : hasPhoto ? 'Reemplazar foto' : 'Agregar foto (opcional)'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                setPhoto(e.target.files?.[0] ?? null)
                setSaved(false)
              }}
            />
          </label>
          {hasPhoto && !photo && (
            <p className="text-[11px] text-primary-600 mt-1">✓ Ya tiene foto guardada</p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400">
          La familia no autorizó fotos de {firstName}. Solo puedes dejar la nota.
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary text-xs py-1.5 px-3"
        >
          {saving ? 'Guardando...' : saved ? <><FaCheck className="mr-1" /> Guardado</> : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
