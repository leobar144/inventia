import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyWompiWebhookSignature } from '@/lib/wompi'
import { applyApprovedPayment } from '@/lib/payments'

interface WompiTransaction {
  id: string
  reference: string
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'
  amount_in_cents: number
  currency: string
}

export async function POST(request: Request) {
  const payload = await request.json()

  let validSignature = false
  try {
    validSignature = verifyWompiWebhookSignature(payload)
  } catch {
    validSignature = false
  }

  if (!validSignature) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  const transaction: WompiTransaction = payload.data.transaction

  const admin = createServiceRoleClient()

  const { data: payment } = await admin
    .from('payments')
    .select('id, enrollment_id, parent_id, referrer_parent_id, consumed_credit_id, status')
    .eq('reference', transaction.reference)
    .single()

  if (!payment) {
    // Referencia desconocida — no es un pago que hayamos creado nosotros, ignorar.
    return NextResponse.json({ received: true })
  }

  // Wompi reintenta los webhooks. Si este pago ya quedó APPROVED, no volvemos a
  // acreditar referidos ni a tocar la inscripción: acusamos recibo y salimos.
  if (payment.status === 'APPROVED') {
    return NextResponse.json({ received: true, alreadyProcessed: true })
  }

  await admin
    .from('payments')
    .update({
      wompi_transaction_id: transaction.id,
      status: transaction.status,
      raw_response: transaction,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (transaction.status === 'APPROVED') {
    await applyApprovedPayment(admin, payment)
  }

  return NextResponse.json({ received: true })
}
