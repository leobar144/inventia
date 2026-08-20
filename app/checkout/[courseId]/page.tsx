'use client'

import { useEffect, useRef, useState, use, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PRICING_PLANS } from '@/lib/constants'
import { PLAN_IDS } from '@/lib/plans'
import type { Course } from '@/types'

interface PaymentData {
  reference: string
  amountInCents: number
  currency: string
  signature: string
  publicKey: string
  discountCents: number
  planId: string
  planName: string
  classes: number
}

function CheckoutContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')

  const [course, setCourse] = useState<Course | null>(null)
  const [prices, setPrices] = useState<Record<string, number> | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!childId) {
      setError('Falta seleccionar el hijo/a a inscribir.')
      return
    }

    const supabase = createClient()

    Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase
        .from('course_plan_prices')
        .select('plan_id, price')
        .eq('course_id', courseId)
        .eq('is_active', true),
    ]).then(([courseRes, pricesRes]) => {
      if (!courseRes.data) {
        setError('Curso no encontrado.')
        return
      }
      setCourse(courseRes.data)

      const priceMap = Object.fromEntries(
        (pricesRes.data ?? []).map((row) => [row.plan_id, row.price])
      )
      setPrices(priceMap)

      // Preselecciona el plan destacado si tiene precio; si no, el primero disponible.
      const highlighted = PRICING_PLANS.find((p) => p.highlight)
      const available = PLAN_IDS.filter((id) => priceMap[id] != null)
      setSelectedPlan(
        highlighted && priceMap[highlighted.id] != null ? highlighted.id : (available[0] ?? null)
      )
    })
  }, [courseId, childId])

  const handlePrepare = async () => {
    if (!selectedPlan) return
    setPreparing(true)
    setError(null)

    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        childId,
        planId: selectedPlan,
        referralCode: referralCode || undefined,
      }),
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
      `${window.location.origin}/checkout/${courseId}/resultado?reference=${payment.reference}`
    )
    form.appendChild(script)
    widgetContainerRef.current.appendChild(form)
  }, [payment, courseId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const availablePlans = PRICING_PLANS.filter((p) => prices?.[p.id] != null)

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto card p-8">
        <h1 className="text-2xl font-heading font-bold mb-6">Confirmar inscripción</h1>

        {!course || !prices ? (
          <p className="text-gray-600">Cargando...</p>
        ) : (
          <>
            <div className="border-b border-gray-100 pb-4 mb-6">
              <p className="font-bold">{course.title}</p>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>

            {!payment ? (
              <>
                {availablePlans.length === 0 ? (
                  <p className="text-gray-600">
                    Este curso todavía no tiene planes disponibles. Escríbenos por WhatsApp y te
                    ayudamos.
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-3">Elige tu plan</p>
                    <div className="space-y-3 mb-6">
                      {availablePlans.map((plan) => {
                        const price = prices[plan.id]
                        const isSelected = selectedPlan === plan.id
                        const perClass = Math.round(price / plan.classes)

                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold">
                                    {plan.levelIcon} {plan.name}
                                  </span>
                                  {plan.highlight && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">
                                      Más elegido
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {plan.classes} clases · ${perClass.toLocaleString('es-CO')} por
                                  clase
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{plan.unlocks}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-lg font-bold text-primary-600">
                                  ${price.toLocaleString('es-CO')}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
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

                    <button
                      onClick={handlePrepare}
                      disabled={preparing || !selectedPlan}
                      className="btn btn-primary w-full disabled:opacity-40"
                    >
                      {preparing ? 'Preparando...' : 'Continuar al pago'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="rounded-lg bg-gray-50 p-4 mb-4 text-sm">
                  <p>
                    <strong>Plan {payment.planName}</strong> · {payment.classes} clases
                  </p>
                </div>

                {payment.discountCents > 0 && (
                  <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                    🎁 Descuento de referido aplicado: -$
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
          </>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={null}>
      <CheckoutContent params={params} />
    </Suspense>
  )
}
