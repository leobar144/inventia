'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAYMENT_METHODS } from '@/lib/payments'
import { getPlan } from '@/lib/plans'
import type { ChildOption, CourseWithInstructor } from '@/lib/supabase/admin-queries'

export default function ManualPaymentForm({
  students,
  courses,
}: {
  students: ChildOption[]
  courses: CourseWithInstructor[]
}) {
  const router = useRouter()
  const [childId, setChildId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [planId, setPlanId] = useState('')
  const [method, setMethod] = useState<string>('efectivo')
  const [amount, setAmount] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedCourse = courses.find((c) => c.id === courseId)
  const availablePlans = selectedCourse?.plan_prices ?? []
  const selectedPrice = availablePlans.find((p) => p.plan_id === planId)?.price ?? null

  const reset = () => {
    setChildId('')
    setCourseId('')
    setPlanId('')
    setAmount('')
    setReferralCode('')
    setNotes('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const res = await fetch('/api/admin/payments/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        courseId,
        planId,
        method,
        amount: amount ? Number(amount) : undefined,
        referralCode: referralCode || undefined,
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
      `Pago de $${body.amount?.toLocaleString('es-CO')} registrado para ${body.childName}. La inscripción quedó activa.`
    )
    reset()
    router.refresh()
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
          <select
            required
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value)
              setPlanId('')
              setAmount('')
            }}
            className="input-field"
          >
            <option value="">Selecciona...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          {availablePlans.length === 0 ? (
            <p className="text-sm text-accent-700">
              Este curso no tiene planes con precio. Configúralos antes de registrar un pago.
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-2">
              {availablePlans.map((pp) => {
                const plan = getPlan(pp.plan_id)
                const isSelected = planId === pp.plan_id
                return (
                  <button
                    key={pp.plan_id}
                    type="button"
                    onClick={() => {
                      setPlanId(pp.plan_id)
                      setAmount('')
                    }}
                    className={`rounded-lg border-2 p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-bold text-sm">
                      {plan?.levelIcon} {plan?.name ?? pp.plan_id}
                    </p>
                    <p className="text-xs text-gray-500">{plan?.classes} clases</p>
                    <p className="text-sm font-bold text-primary-600 mt-1">
                      ${pp.price.toLocaleString('es-CO')}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
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
            Monto recibido (opcional)
          </label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder={
              selectedPrice != null ? selectedPrice.toLocaleString('es-CO') : 'Precio del plan'
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Déjalo vacío para cobrar el precio del plan. Llénalo solo si acordaste otro valor.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código de referido (opcional)
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="input-field"
            placeholder="Si alguien la recomendó"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            placeholder="Ej: pagó en el gimnasio, recibo #12"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-primary-700 bg-primary-50 rounded-lg p-3 text-sm font-medium">
          ✅ {success}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !childId || !courseId || !planId}
        className="btn btn-primary disabled:opacity-40"
      >
        {saving ? 'Registrando...' : 'Registrar pago y activar inscripción'}
      </button>
    </form>
  )
}
