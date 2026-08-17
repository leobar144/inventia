'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PaymentStatus } from '@/types'
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

function ResultadoContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState<PaymentStatus | 'LOADING'>('LOADING')

  useEffect(() => {
    if (!reference) return

    let attempts = 0
    const supabase = createClient()

    const poll = async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('reference', reference)
        .single()

      if (data && data.status !== 'PENDING') {
        setStatus(data.status)
        return
      }

      attempts += 1
      if (attempts < 15) {
        setTimeout(poll, 2000)
      } else {
        setStatus(data?.status ?? 'PENDING')
      }
    }

    poll()
  }, [reference])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-10 max-w-md text-center">
        {status === 'LOADING' || status === 'PENDING' ? (
          <>
            <FaSpinner className="text-5xl text-primary-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold mb-2">Confirmando tu pago...</h1>
            <p className="text-gray-600">Esto puede tardar unos segundos.</p>
          </>
        ) : status === 'APPROVED' ? (
          <>
            <FaCheckCircle className="text-5xl text-primary-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">¡Pago aprobado!</h1>
            <p className="text-gray-600 mb-6">La inscripción ya está activa.</p>
            <Link href="/portal" className="btn btn-primary">
              Ir al Portal
            </Link>
          </>
        ) : (
          <>
            <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">El pago no se completó</h1>
            <p className="text-gray-600 mb-6">Puedes intentarlo de nuevo desde el Portal.</p>
            <Link href="/portal" className="btn btn-primary">
              Volver al Portal
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={null}>
      <ResultadoContent />
    </Suspense>
  )
}
