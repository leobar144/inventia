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
}

function CheckoutContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')

  const [course, setCourse] = useState<Course | null>(null)
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!childId) {
        setError('Falta seleccionar el hijo/a a inscribir.')
        return
      }

      const supabase = createClient()
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (!courseData) {
        setError('Curso no encontrado.')
        return
      }
      setCourse(courseData)

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, childId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'No pudimos preparar el pago.')
        return
      }

      const data: PaymentData = await res.json()
      setPayment(data)
    }

    load()
  }, [courseId, childId])

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

        {course && payment ? (
          <>
            <div className="border-b border-gray-100 pb-4 mb-4">
              <p className="font-bold">{course.title}</p>
              <p className="text-gray-600 text-sm">{course.description}</p>
            </div>
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
        ) : (
          <p className="text-gray-600">Preparando tu pago...</p>
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
