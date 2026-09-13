'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { generateDates, formatDateLabel, WEEKDAYS, MAX_BULK_SESSIONS } from '@/lib/schedule'
import { TUTORING_BLOCK_CAPACITY } from '@/lib/economics'

export interface MonitorOption {
  id: string
  full_name: string | null
}

/**
 * Crea las tardes de sala en lote.
 *
 * Usa el mismo `generateDates` que el generador de clases, y muestra la vista
 * previa con las fechas reales antes de crear nada: el usuario ya tuvo que
 * corregir a mano sesiones mal programadas, y la vista previa es lo que evita
 * que vuelva a pasar.
 */
export default function TutoringBlockForm({ monitors }: { monitors: MonitorOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('15:00')
  const [endTime, setEndTime] = useState('18:00')
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5])
  const [count, setCount] = useState('20')
  const [monitorId, setMonitorId] = useState('')
  const [capacity, setCapacity] = useState(String(TUTORING_BLOCK_CAPACITY))
  const [modality, setModality] = useState<'presencial' | 'virtual'>('presencial')
  const [meetingLink, setMeetingLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const preview = useMemo(
    () => generateDates({ startDate, weekdays, count: Number(count) || 0 }),
    [startDate, weekdays, count]
  )

  // Al pasar a virtual el cupo se borra solo: no hay sillas que se acaben, y
  // dejar el 12 puesto haría que la sala virtual rechazara niños sin razón.
  const changeModality = (next: 'presencial' | 'virtual') => {
    setModality(next)
    setCapacity(next === 'virtual' ? '' : String(TUTORING_BLOCK_CAPACITY))
  }

  const toggleWeekday = (value: number) =>
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const res = await fetch('/api/admin/tutoring/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        weekdays,
        count: Number(count),
        startTime,
        endTime,
        monitorId: monitorId || null,
        // Vacío = sin límite. El servidor lo guarda como null.
        capacity: capacity.trim() === '' ? null : Number(capacity),
        modality,
        meetingLink: meetingLink || null,
      }),
    })

    setSaving(false)
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error || 'No pudimos crear las tardes.')
      return
    }

    setSuccess(
      body.skipped > 0
        ? `Se crearon ${body.created} tardes. ${body.skipped} ya existían y se dejaron como estaban.`
        : `Se crearon ${body.created} tardes.`
    )
    router.refresh()
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
        + Programar tardes
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Programar tardes de sala</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Desde</span>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Hora de inicio</span>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Hora de fin</span>
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
      </div>

      <div>
        <span className="text-sm font-medium text-gray-700">Días</span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleWeekday(day.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border ${
                weekdays.includes(day.value)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Cuántas tardes</span>
          <input
            type="number"
            min={1}
            max={MAX_BULK_SESSIONS}
            required
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Cupo por tarde</span>
          <input
            type="number"
            min={1}
            max={60}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Sin límite"
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
          <span className="text-[11px] text-gray-400">
            {capacity.trim() === ''
              ? 'Sin límite: caben todos los que tengan mensualidad.'
              : 'Déjelo vacío para no poner tope.'}
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Monitor</span>
          <select
            value={monitorId}
            onChange={(e) => setMonitorId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          >
            <option value="">Sin asignar</option>
            {monitors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || 'Sin nombre'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Modalidad</span>
          <select
            value={modality}
            onChange={(e) => changeModality(e.target.value as 'presencial' | 'virtual')}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          >
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>
        </label>
        {modality === 'virtual' && (
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Enlace de la reunión</span>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/…"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
            />
          </label>
        )}
      </div>

      {/* Vista previa. Las fechas reales antes de crear nada. */}
      {preview.length > 0 && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Se van a crear {preview.length} tardes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview.slice(0, 24).map((date) => (
              <span
                key={date}
                className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-gray-600"
              >
                {formatDateLabel(date)}
              </span>
            ))}
            {preview.length > 24 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                y {preview.length - 24} más…
              </span>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-primary-600 font-medium">{success}</p>}

      <button
        type="submit"
        disabled={saving || preview.length === 0}
        className="btn btn-primary disabled:opacity-50"
      >
        {saving ? 'Creando…' : `Crear ${preview.length} tardes`}
      </button>
    </form>
  )
}
