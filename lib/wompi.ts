import { createHash } from 'crypto'

/**
 * Firma de integridad que exige el Checkout Web de Wompi.
 * Spec: SHA256(referencia + montoEnCentavos + moneda + secretoDeIntegridad)
 * Se genera siempre en el servidor — el secreto nunca llega al navegador.
 */
export function generateWompiSignature(
  reference: string,
  amountInCents: number,
  currency: string
): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET
  if (!secret) throw new Error('Missing WOMPI_INTEGRITY_SECRET')

  const raw = `${reference}${amountInCents}${currency}${secret}`
  return createHash('sha256').update(raw).digest('hex')
}

interface WompiEventPayload {
  event: string
  data: { transaction: Record<string, unknown> }
  signature: { properties: string[]; checksum: string }
  timestamp: number
}

/**
 * Verifica el checksum del webhook de Wompi antes de confiar en el evento.
 * Spec: SHA256(valores de las props firmadas, en orden, concatenados + timestamp + eventsSecret)
 */
export function verifyWompiWebhookSignature(payload: WompiEventPayload): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET
  if (!secret) throw new Error('Missing WOMPI_EVENTS_SECRET')

  const values = payload.signature.properties.map((path) => {
    const keys = path.split('.')
    let value: unknown = payload.data
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }
    return String(value ?? '')
  })

  const raw = `${values.join('')}${payload.timestamp}${secret}`
  const computed = createHash('sha256').update(raw).digest('hex')
  return computed === payload.signature.checksum
}

export function pesosToWompiCents(pesos: number): number {
  return Math.round(pesos * 100)
}
