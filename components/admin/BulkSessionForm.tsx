'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { generateDates, formatDateLabel, WEEKDAYS, MAX_BULK_SESSIONS } from '@/lib/schedule'
import { PRICING_PLANS } from '@/lib/constants'
import type { CourseWithInstructor } from '@/lib/supabase/admin-queries'

export default function BulkSessionForm({ courses }: { courses: CourseWithInstructor[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [time, setTime] = useState('16:00')
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [count, setCount] = useState('12')
  const [modality, setModality] = useState<'virtual' | 'presencial'>('presencial')
  const [googleMeetLink, setGoogleMeetLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const preview = useMemo(
    () => generateDates({ startDate, weekdays, count: Number(count) || 0 }),
    [startDate, weekdays, count]
  )

  const toggleWeekday = (value: number) => {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const res = await fetch('/api/admin/sessions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        startDate,
        time,
        weekdays,
        count: Number(count),
        modality,
        googleMeetLink: googleMeetLink || null,
      }),
    })

    setSaving(false)
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error || 'No pudimos crear las sesiones.')
      return
    }

    setSuccess(`Se crearon ${body.created} clases.`)
    setStartDate('')
    setWeekdays([])
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        ⚡ Programar clases en lote
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4 w-full">
      <div>
        <h2 className="text-lg font-bold">Programar clases en lote</h2>
        <p className="text-sm text-gray-600">
          Crea todas las clases de un curso de una vez, en vez de una por una.
        </p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && (
        <div className="p-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
          ✅ {success}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuántas clases?
          </label>
          <input
            type="number"
            required
            min={1}
            max={MAX_BULK_SESSIONS}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="input-field"
          />
          <div className="flex gap-2 mt-2">
            {PRICING_PLANS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setCount(String(plan.classes))}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  Number(count) === plan.classes
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-primary-300'
                }`}
              >
                {plan.name} ({plan.classes})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleWeekday(day.value)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                weekdays.includes(day.value)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primera clase</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as 'virtual' | 'presencial')}
            className="input-field"
          >
            <option value="presencial">📍 Presencial</option>
            <option value="virtual">💻 Virtual</option>
          </select>
        </div>
      </div>

      {modality === 'virtual' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link de Google Meet (se usa en todas)
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

      {preview.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Vista previa — {preview.length} clases, del{' '}
            <strong>{formatDateLabel(preview[0])}</strong> al{' '}
            <strong>{formatDateLabel(preview[preview.length - 1])}</strong>
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {preview.map((date, i) => (
              <span
                key={date}
                className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-gray-600"
              >
                {i + 1}. {formatDateLabel(date)} · {time}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !courseId || preview.length === 0}
          className="btn btn-primary disabled:opacity-40"
        >
          {saving ? 'Creando...' : `Crear ${preview.length || ''} clases`}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
          Cerrar
        </button>
      </div>
    </form>
  )
}
