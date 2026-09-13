/**
 * Guía gratuita "Protocolo de IA honesta para las tareas" y su lista de espera.
 *
 * Lógica pura, sin Supabase: la usan el formulario público (cliente), la ruta
 * que guarda el registro y el panel de administración.
 */

/** Dónde vive el PDF. Es un archivo estático en /public, sin datos de nadie. */
export const PROTOCOLO_PDF_PATH = '/recursos/protocolo-ia-honesta.pdf'

/** Nombre del curso en video al que lleva la lista de espera. */
export const CURSO_PADRES_NOMBRE = 'IA y tareas en casa'

/**
 * Rangos de edad, no edades exactas: para saber a qué familias hablarle en el
 * curso basta el rango, y así nunca se guarda un dato preciso de un menor.
 */
export const AGE_BANDS = [
  { id: '4-6', label: '4 a 6 años' },
  { id: '7-10', label: '7 a 10 años' },
  { id: '11-13', label: '11 a 13 años' },
  { id: '14-16', label: '14 a 16 años' },
  { id: 'varias', label: 'Hijos de varias edades' },
] as const

export type AgeBand = (typeof AGE_BANDS)[number]['id']

export function isValidAgeBand(value: string): value is AgeBand {
  return AGE_BANDS.some((b) => b.id === value)
}

export function ageBandLabel(id: string | null): string {
  if (!id) return '—'
  return AGE_BANDS.find((b) => b.id === id)?.label ?? id
}

/**
 * Deja el WhatsApp en un formato único: solo dígitos, con indicativo.
 *
 * Sin esto, "300 123 4567", "+57 3001234567" y "573001234567" serían tres
 * familias distintas, y a la misma mamá le llegarían tres mensajes.
 */
export function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')

  // Celular colombiano escrito sin indicativo.
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`

  // Celular colombiano con indicativo.
  if (digits.length === 12 && digits.startsWith('573')) return digits

  // Familias en el exterior: indicativo + número. Un fijo colombiano de 10
  // dígitos (601…) no entra por aquí porque no es WhatsApp.
  if (digits.length >= 11 && digits.length <= 15 && !digits.startsWith('0')) return digits

  return null
}

/** Normaliza el ?origen= del enlace para poder agrupar por canal. */
export function sanitizeSource(raw?: string | null): string | null {
  const clean = (raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40)
  return clean || null
}

/**
 * Primer mensaje de WhatsApp para una familia de la lista.
 *
 * Prellenado a propósito, igual que con los jardines: con decenas de familias
 * por escribir, redactar cada mensaje desde cero es lo que hace que no se envíe.
 */
export function buildWaitlistWhatsAppMessage(params: {
  fullName: string
  wantsCourse: boolean
}): string {
  const firstName = params.fullName.trim().split(/\s+/)[0]

  if (params.wantsCourse) {
    return `Hola ${firstName}, le escribe INVENTIA 🤖

Gracias por descargar el Protocolo de IA honesta para las tareas. Nos pidió que le avisáramos de la preventa del curso en video «${CURSO_PADRES_NOMBRE}», y queríamos contarle a usted primero.

¿Le comparto los detalles?`
  }

  return `Hola ${firstName}, le escribe INVENTIA 🤖

Gracias por descargar el Protocolo de IA honesta para las tareas. ¿Pudo ponerlo en práctica en casa? Nos encantaría saber cómo le fue.`
}
