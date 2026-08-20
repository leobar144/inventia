'use client'

import { useEffect, useRef, useState, use, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Course } from '@/types'

interface PaymentData {
  reference: string
  amountInCents: number
  currency: string
  signature: string
  publicKey: string
  discountCents: number
}

function CheckoutContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')

  const [course, setCourse] = useState<Course | null>(null)
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
    supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
      .then(({ data }) => {
        if (!data) setError('Curso no encontrado.')
        else setCourse(data)
      })
  }, [courseId, childId])

  const handlePrepare = async () => {
    setPreparing(true)
    setError(null)

    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, childId, referralCode: referralCode || undefined }),
    })

    setPreparing(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos preparar el pago.')
      return
    }

    const data: PaymentData = await res.json()
    setPayment(data)
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

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto card p-8">
        <h1 className="text-2xl font-heading font-bold mb-6">Confirmar inscripción</h1>

        {!course ? (
          <p className="text-gray-600">Cargando...</p>
        ) : (
          <>
            <div className="border-b border-gray-100 pb-4 mb-4">
              <p className="font-bold">{course.title}</p>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>

            {!payment ? (
              <>
                <div className="mb-4">
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
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600">Precio del curso</span>
                  <span className="text-xl font-bold">
                    ${course.price.toLocaleString('es-CO')} {course.currency}
                  </span>
                </div>
                <button onClick={handlePrepare} disabled={preparing} className="btn btn-primary w-full">
                  {preparing ? 'Preparando...' : 'Continuar al pago'}
                </button>
              </>
            ) : (
              <>
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
