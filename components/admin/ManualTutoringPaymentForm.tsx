'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAYMENT_METHODS } from '@/lib/payments'
import { planFrequencyLabel, type TutoringPlanRow } from '@/lib/homework'
import type { ChildOption } from '@/lib/supabase/admin-queries'

/**
 * Registro de un pago de la Sala de Tareas recibido por fuera de la plataforma.
 *
 * Es el gemelo del formulario de cursos, con una diferencia: aquí el monto es
 * obligatorio. Los planes de la Sala de Tareas todavía no tienen precio
 * publicado, así que no hay precio de lista que proponer.
 */
export default function ManualTutoringPaymentForm({
  students,
  plans,
}: {
  students: ChildOption[]
  plans: TutoringPlanRow[]
}) {
  const router = useRouter()
  const [childId, setChildId] = useState('')
  const [planId, setPlanId] = useState('')
  const [method, setMethod] = useState<string>('transferencia')
  const [amount, setAmount] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = () => {
    setChildId('')
    setPlanId('')
    setAmount('')
    setStartsOn('')
    setNotes('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const res = await fetch('/api/admin/payments/manual-tutoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        planId,
        method,
        amount: Number(amount),
        startsOn: startsOn || undefined,
        notes: notes || undefined,
      }),
    })

    setSaving(false)
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error || 'No pudimos registrar el pago.')
      return
    }

    setSuccess(
      `Pago de $${body.amount?.toLocaleString('es-CO')} registrado para ${body.childName}. ` +
        `${body.planName} activo hasta el ${body.endsOn}.`
    )
    reset()
    router.refresh()
  }

  if (plans.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-gray-600">
          No hay planes de Sala de Tareas activos. Actívalos antes de registrar un pago.
        </p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-gray-600">
          Todavía no hay niños registrados. El acudiente debe crear su cuenta y agregar al niño
          antes de poder registrarle un pago.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niño/a</label>
          <select
            required
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="input-field"
          >
            <option value="">Selecciona...</option>
            {students.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} — {c.parent_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <select
            required
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="input-field"
          >
            <option value="">Selecciona...</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {planFrequencyLabel(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto recibido</label>
          <input
            type="number"
            required
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder="Ej: 560000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Obligatorio: los planes todavía no tienen precio publicado.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medio de pago</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="input-field"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arranca el (opcional)
          </label>
          <input
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Vacío = hoy. El mes se cuenta desde ahí.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          placeholder="Ej: transferencia Nequi, comprobante #4412"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-primary-700 bg-primary-50 rounded-lg p-3 text-sm font-medium">
          ✅ {success}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !childId || !planId || !amount}
        className="btn btn-primary disabled:opacity-40"
      >
        {saving ? 'Registrando...' : 'Registrar pago y activar la mensualidad'}
      </button>
    </form>
  )
}
