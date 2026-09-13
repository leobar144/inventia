'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MonitorOption } from './TutoringBlockForm'

/**
 * Asigna un monitor a muchas tardes de una vez.
 *
 * Con varios profesores rotando, asignar de a una tarde no se hace nunca —
 * y las tardes se quedan sin monitor hasta que alguien reclama. Aquí se piensa
 * como se piensa un horario de verdad: "Fulano, presencial, de aquí a aquí".
 */
export default function TutoringMonitorAssign({
  monitors,
  defaultFrom,
  defaultTo,
}: {
  monitors: MonitorOption[]
  defaultFrom: string
  defaultTo: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [monitorId, setMonitorId] = useState('')
  const [modality, setModality] = useState<'presencial' | 'virtual' | 'ambas'>('presencial')
  const [fromDate, setFromDate] = useState(defaultFrom)
  const [toDate, setToDate] = useState(defaultTo)
  const [onlyUnassigned, setOnlyUnassigned] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const res = await fetch('/api/admin/tutoring/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monitorId: monitorId || null,
        modality,
        fromDate,
        toDate,
        onlyUnassigned,
      }),
    })

    setSaving(false)
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error || 'No pudimos asignar el monitor.')
      return
    }

    const nombre = monitors.find((m) => m.id === monitorId)?.full_name ?? 'Sin monitor'
    setSuccess(
      body.updated === 0
        ? 'Ninguna tarde cambió. Revise el rango, la modalidad o desmarque “solo las que no tienen monitor”.'
        : `${body.updated} tarde(s) quedaron a cargo de ${nombre}.`
    )
    router.refresh()
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline">
        Asignar monitor
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Asignar monitor a varias tardes</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>

      {monitors.length === 0 && (
        <p className="text-sm text-accent-700 bg-accent-50 border border-accent-200 rounded-lg p-3">
          Todavía no hay profesores en el sistema. Invítelos primero y vuelva aquí a asignarles las
          tardes.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Monitor</span>
          <select
            value={monitorId}
            onChange={(e) => setMonitorId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          >
            <option value="">Quitar el monitor (dejar sin asignar)</option>
            {monitors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || 'Sin nombre'}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Modalidad</span>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as 'presencial' | 'virtual' | 'ambas')}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          >
            <option value="presencial">Solo presencial</option>
            <option value="virtual">Solo virtual</option>
            <option value="ambas">Las dos</option>
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Desde</span>
          <input
            type="date"
            required
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Hasta</span>
          <input
            type="date"
            required
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 p-2.5"
          />
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={onlyUnassigned}
          onChange={(e) => setOnlyUnassigned(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Solo las tardes que todavía no tienen monitor
          <span className="block text-xs text-gray-500">
            Déjelo marcado para no quitarle tardes a otro profesor sin darse cuenta.
          </span>
        </span>
      </label>

      {modality === 'ambas' && (
        <p className="text-xs text-accent-700 bg-accent-50 border border-accent-200 rounded-lg p-3">
          Presencial y virtual corren a la misma hora: una sola persona no puede atender las dos.
          Solo use “las dos” si va a abrir una modalidad a la vez.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-primary-600 font-medium">{success}</p>}

      <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50">
        {saving ? 'Asignando…' : 'Asignar'}
      </button>
    </form>
  )
}
