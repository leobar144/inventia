'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SALA_DE_TAREAS } from '@/lib/homework'

interface PlanRow {
  id: string
  name: string
  sessions_included: number
  /** `null` = sin precio definido. No se puede comprar. */
  price: number | null
}

interface ChildRow {
  id: string
  full_name: string
}

interface PaymentData {
  reference: string
  amountInCents: number
  currency: string
  signature: string
  publicKey: string
  discountCents: number
  discountReason: 'referido' | 'hermano' | 'alumno-stem' | null
  planName: string
  sessionsIncluded: number
  startsOn: string
  endsOn: string
}

const DISCOUNT_LABEL: Record<string, string> = {
  referido: '🎁 Descuento de referido',
  hermano: '👨‍👩‍👧‍👦 Descuento por hermano',
  'alumno-stem': '🤖 Descuento por ser alumno de INVENTIA',
}

function AsesoriaCheckoutContent() {
  const searchParams = useSearchParams()
  const preselectedChild = searchParams.get('childId')

  const [children, setChildren] = useState<ChildRow[]>([])
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [childId, setChildId] = useState<string | null>(preselectedChild)
  const [planId, setPlanId] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError('Inicia sesión para inscribir a tu hijo/a en la Sala de Tareas.')
        setLoading(false)
        return
      }

      Promise.all([
        supabase.from('children').select('id, full_name').eq('parent_id', user.id),
        supabase
          .from('tutoring_plans')
          .select('id, name, sessions_included, price')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]).then(([childrenRes, plansRes]) => {
        const kids = childrenRes.data ?? []
        // Solo se ofrecen los planes que tienen precio: mostrar uno sin precio
        // llevaría al papá hasta el final para que el servidor lo rechace.
        const vendibles = (plansRes.data ?? []).filter((p) => p.price !== null && p.price > 0)
        setChildren(kids)
        setPlans(vendibles)
        setPlanId(vendibles[1]?.id ?? vendibles[0]?.id ?? null)
        if (!preselectedChild && kids.length === 1) setChildId(kids[0].id)
        setLoading(false)
      })
    })
  }, [preselectedChild])

  const handlePrepare = async () => {
    if (!childId || !planId) return
    setPreparing(true)
    setError(null)

    const res = await fetch('/api/tutoring/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, planId, referralCode: referralCode || undefined }),
    })

    setPreparing(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos preparar el pago.')
      return
    }

    setPayment(await res.json())
  }

  useEffect(() => {
    if (!payment || !widgetContainerRef.current) return

    widgetContainerRef.current.innerHTML = ''
    const form = document.createElement('form')
    const script = document.createElement('script')
    script.src = 'https://checkout.wompi.co/widget.js'
    script.setAttribute('data-render', 'button')
    script.setAttribute('data-public-key', payment.publicKey)
    script.setAttribute('data-currency', payment.currency)
    script.setAttribute('data-amount-in-cents', String(payment.amountInCents))
    script.setAttribute('data-reference', payment.reference)
    script.setAttribute('data-signature:integrity', payment.signature)
    script.setAttribute(
      'data-redirect-url',
      `${window.location.origin}/checkout/asesoria/resultado?reference=${payment.reference}`
    )
    form.appendChild(script)
    widgetContainerRef.current.appendChild(form)
  }, [payment])

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto card p-8">
        <h1 className="text-2xl font-heading font-bold mb-1">{SALA_DE_TAREAS.name}</h1>
        <p className="text-gray-600 text-sm mb-6">{SALA_DE_TAREAS.scheduleLabel}</p>

        {loading ? (
          <p className="text-gray-600">Cargando…</p>
        ) : error && !payment && children.length === 0 && plans.length === 0 ? (
          <>
            <p className="text-red-600 mb-6">{error}</p>
            <a href="/login?next=/checkout/asesoria" className="btn btn-primary">
              Iniciar sesión
            </a>
          </>
        ) : !payment ? (
          <>
            {plans.length === 0 ? (
              <p className="text-gray-600">
                Todavía no tenemos los precios publicados. Escríbenos por WhatsApp al{' '}
                <strong>350 211 4492</strong> y te confirmamos el valor y el cupo.
              </p>
            ) : children.length === 0 ? (
              <p className="text-gray-600">
                Primero registra a tu hijo/a en el portal y vuelve a esta página.
              </p>
            ) : (
              <>
                {children.length > 1 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">¿A quién inscribes?</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => setChildId(child.id)}
                          className={`text-left rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                            childId === child.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {child.full_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm font-medium text-gray-700 mb-3">Elige el plan</p>
                <div className="space-y-3 mb-6">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanId(plan.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                        planId === plan.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="font-bold">{plan.name}</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {plan.sessions_included}{' '}
                            {plan.sessions_included === 1 ? 'tarde' : 'tardes'} · $
                            {Math.round(
                              (plan.price ?? 0) / plan.sessions_included
                            ).toLocaleString('es-CO')}{' '}
                            por tarde
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary-600 shrink-0">
                          ${(plan.price ?? 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Tienes un código de referido? (opcional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="input-field"
                    placeholder="Código de referido"
                  />
                </div>

                {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

                <button
                  onClick={handlePrepare}
                  disabled={preparing || !childId || !planId}
                  className="btn btn-primary w-full disabled:opacity-40"
                >
                  {preparing ? 'Preparando…' : 'Continuar al pago'}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="rounded-lg bg-gray-50 p-4 mb-4 text-sm">
              <p>
                <strong>{payment.planName}</strong> · {payment.sessionsIncluded} tardes
              </p>
              <p className="text-gray-600 mt-1">
                Del {payment.startsOn} al {payment.endsOn}
              </p>
            </div>

            {payment.discountCents > 0 && payment.discountReason && (
              <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                {DISCOUNT_LABEL[payment.discountReason]}: -$
                {(payment.discountCents / 100).toLocaleString('es-CO')}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Total a pagar</span>
              <span className="text-2xl font-bold text-primary-600">
                ${(payment.amountInCents / 100).toLocaleString('es-CO')} {payment.currency}
              </span>
            </div>
            <div ref={widgetContainerRef} />
            <p className="text-xs text-gray-500 mt-4 text-center">
              Pago seguro procesado por Wompi. Aceptamos PSE, tarjetas y Nequi.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AsesoriaCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <AsesoriaCheckoutContent />
    </Suspense>
  )
}
