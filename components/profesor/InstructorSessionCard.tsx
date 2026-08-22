'use client'

import { useState } from 'react'
import { FaVideo } from 'react-icons/fa'
import ClassNoteEditor from './ClassNoteEditor'
import type { InstructorSessionRow } from '@/lib/supabase/instructor-queries'

export default function InstructorSessionCard({ session }: { session: InstructorSessionRow }) {
  const [checked, setChecked] = useState<Set<string>>(
    new Set(session.roster.filter((c) => c.alreadyMarked).map((c) => c.childId))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const paidCount = session.roster.filter((c) => c.enrollmentStatus === 'active').length
  const totalCount = session.roster.length

  const toggle = (childId: string) => {
    setSaved(false)
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(childId)) next.delete(childId)
      else next.add(childId)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, childIds: Array.from(checked) }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-1">
        <div>
          {/* El curso va primero: un profesor que dicta dos cursos veía dos
              "Clase 3" seguidas y tenía que leer la línea de abajo para saber
              cuál era cuál. Cada curso numera sus clases desde 1. */}
          <p className="font-bold">
            {session.courseTitle} <span className="text-gray-400 font-normal">·</span>{' '}
            <span className="text-gray-600">{session.sessionTitle}</span>
          </p>
          {session.moduleTitle && (
            <p className="text-xs text-primary-600 font-medium mt-0.5">
              Módulo: {session.moduleTitle}
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {new Date(session.scheduledAt).toLocaleString('es-CO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
          {session.modality === 'presencial' ? '📍 Presencial' : '💻 Virtual'}
        </span>
        <span className="text-sm font-medium text-gray-700">
          Cuórum: {paidCount}/{totalCount} pagados
        </span>
        {session.modality === 'virtual' && session.googleMeetLink && (
          <a
            href={session.googleMeetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            <FaVideo /> Unirse
          </a>
        )}
      </div>

      {session.roster.length === 0 ? (
        <p className="text-sm text-gray-500">Nadie inscrito en este curso todavía.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {session.roster.map((child) => (
            <div key={child.childId} className="text-sm">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked.has(child.childId)}
                    onChange={() => toggle(child.childId)}
                    className="w-auto"
                  />
                  <span>{child.childName}</span>
                </label>
                <div className="flex items-center gap-3">
                  <ClassNoteEditor
                    childId={child.childId}
                    childName={child.childName}
                    sessionId={session.sessionId}
                    initialNote={child.note}
                    hasPhoto={child.hasPhoto}
                    photoConsent={child.photoConsent}
                  />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      child.enrollmentStatus === 'active'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-accent-100 text-accent-700'
                    }`}
                  >
                    {child.enrollmentStatus === 'active' ? 'Pagado' : 'Pago pendiente'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {session.roster.length > 0 && (
        <button onClick={handleSave} disabled={saving} className="btn btn-primary text-sm py-2">
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar asistencia'}
        </button>
      )}
    </div>
  )
}
