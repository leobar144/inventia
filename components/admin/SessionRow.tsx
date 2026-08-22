'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaTrash, FaPencilAlt } from 'react-icons/fa'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'
import type { CourseSessionRow } from '@/lib/supabase/admin-queries'

/**
 * Convierte un instante UTC al formato que espera un input datetime-local,
 * en hora de Bogotá. Sin esto el campo mostraría la hora UTC y el
 * administrador editaría una hora distinta a la que ve en el resto del panel.
 */
function toBogotaInputValue(iso: string): string {
  const d = new Date(iso)
  const bogota = new Date(d.getTime() - 5 * 60 * 60 * 1000)
  return bogota.toISOString().slice(0, 16)
}

/** Y de vuelta: lo que el administrador escribe es hora de Bogotá. */
function bogotaInputToIso(value: string): string {
  return new Date(`${value}:00.000Z`).toISOString().replace('Z', '') + 'Z'
}

export default function SessionRow({
  session,
  curriculumLevelId,
}: {
  session: CourseSessionRow
  curriculumLevelId: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(session.title)
  const [scheduledAt, setScheduledAt] = useState(toBogotaInputValue(session.scheduledAt))
  const [modality, setModality] = useState(session.modality)
  const [googleMeetLink, setGoogleMeetLink] = useState(session.googleMeetLink ?? '')
  const [moduleNumber, setModuleNumber] = useState(session.moduleNumber?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const level = CURRICULUM_LEVELS.find((l) => l.id === curriculumLevelId)
  const moduleTitle = level?.modules.find((m) => m.number === session.moduleNumber)?.title

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const res = await fetch(`/api/admin/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        scheduledAt: bogotaInputToIso(scheduledAt),
        modality,
        googleMeetLink: googleMeetLink || null,
        moduleNumber: moduleNumber ? Number(moduleNumber) : null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos guardar.')
      return
    }

    setEditing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm(`¿Borrar "${session.title}"? Esta acción no se puede deshacer.`)) return

    setSaving(true)
    setError(null)

    const res = await fetch(`/api/admin/sessions/${session.id}`, { method: 'DELETE' })
    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos borrar.')
      return
    }

    router.refresh()
  }

  if (editing) {
    return (
      <div className="card p-4 space-y-3 border-primary-300">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha y hora (Bogotá)</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Modalidad</label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as 'presencial' | 'virtual')}
              className="input-field text-sm"
            >
              <option value="presencial">📍 Presencial</option>
              <option value="virtual">💻 Virtual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Módulo</label>
            <select
              value={moduleNumber}
              onChange={(e) => setModuleNumber(e.target.value)}
              className="input-field text-sm"
              disabled={!level}
            >
              <option value="">{level ? 'Sin módulo' : 'El curso no tiene nivel'}</option>
              {level?.modules.map((m) => (
                <option key={m.number} value={m.number}>
                  {m.number}. {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {modality === 'virtual' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Link de Google Meet</label>
            <input
              type="url"
              value={googleMeetLink}
              onChange={(e) => setGoogleMeetLink(e.target.value)}
              className="input-field text-sm"
              placeholder="https://meet.google.com/..."
            />
          </div>
        )}

        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-sm py-1.5 px-4"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 flex justify-between items-center gap-4 flex-wrap">
      <div>
        <p className="font-medium">
          {session.title}
          <span className="ml-2 text-xs font-normal text-gray-500">
            {session.modality === 'presencial' ? '📍 Presencial' : '💻 Virtual'}
          </span>
        </p>
        <p className="text-sm text-gray-600 capitalize">
          {new Date(session.scheduledAt).toLocaleString('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/Bogota',
          })}
        </p>
        {moduleTitle && (
          <p className="text-xs text-primary-600">
            Módulo {session.moduleNumber}: {moduleTitle}
          </p>
        )}
        {session.attendanceCount > 0 && (
          <p className="text-xs text-gray-500 mt-0.5">
            {session.attendanceCount} asistencia{session.attendanceCount === 1 ? '' : 's'}{' '}
            registrada{session.attendanceCount === 1 ? '' : 's'}
          </p>
        )}
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>

      <div className="flex gap-3 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
        >
          <FaPencilAlt size={11} /> Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="text-sm text-red-600 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <FaTrash size={11} /> Borrar
        </button>
      </div>
    </div>
  )
}
