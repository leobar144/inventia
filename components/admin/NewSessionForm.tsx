'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'
import type { CourseWithInstructor } from '@/lib/supabase/admin-queries'

export default function NewSessionForm({ courses }: { courses: CourseWithInstructor[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [modality, setModality] = useState<'virtual' | 'presencial'>('virtual')
  const [moduleNumber, setModuleNumber] = useState('')
  const [googleMeetLink, setGoogleMeetLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCourse = courses.find((c) => c.id === courseId)
  const curriculumLevel = useMemo(
    () => CURRICULUM_LEVELS.find((l) => l.id === selectedCourse?.curriculum_level_id),
    [selectedCourse]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const res = await fetch('/api/admin/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        title,
        scheduledAt: new Date(scheduledAt).toISOString(),
        modality,
        moduleNumber: moduleNumber ? Number(moduleNumber) : null,
        googleMeetLink: googleMeetLink || null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('No pudimos crear la sesión. Intenta de nuevo.')
      return
    }

    setCourseId('')
    setTitle('')
    setScheduledAt('')
    setModality('virtual')
    setModuleNumber('')
    setGoogleMeetLink('')
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-outline">
        + Nueva sesión
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-bold">Nueva sesión de clase</h2>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
        <select
          required
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="input-field"
        >
          <option value="">Selecciona un curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="ej. Clase 3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as 'virtual' | 'presencial')}
            className="input-field"
          >
            <option value="virtual">💻 Virtual</option>
            <option value="presencial">📍 Presencial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Módulo del currículo
          </label>
          <select
            value={moduleNumber}
            onChange={(e) => setModuleNumber(e.target.value)}
            className="input-field"
            disabled={!curriculumLevel}
          >
            <option value="">
              {curriculumLevel ? 'Sin módulo asignado' : 'El curso no tiene nivel asignado'}
            </option>
            {curriculumLevel?.modules.map((m) => (
              <option key={m.number} value={m.number}>
                Módulo {m.number}: {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modality === 'virtual' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link de Google Meet
          </label>
          <input
            type="url"
            value={googleMeetLink}
            onChange={(e) => setGoogleMeetLink(e.target.value)}
            className="input-field"
            placeholder="https://meet.google.com/..."
          />
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Creando...' : 'Crear sesión'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
          Cancelar
        </button>
      </div>
    </form>
  )
}
