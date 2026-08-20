/**
 * Generación de fechas para crear sesiones de clase en lote.
 *
 * Todo se maneja como fecha calendario (YYYY-MM-DD) + hora local de Bogotá, y
 * solo al final se convierte a UTC. Colombia no tiene horario de verano, así que
 * el desfase es fijo en UTC-5 — por eso se puede calcular a mano sin librería.
 *
 * Este archivo lo usan tanto el formulario (para la vista previa) como la ruta
 * que crea las sesiones. Es a propósito: si la vista previa y la creación real
 * calcularan fechas por separado, tarde o temprano mostrarían cosas distintas.
 */

const BOGOTA_UTC_OFFSET_HOURS = 5

export const WEEKDAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
] as const

/** Máximo de sesiones que se pueden crear de una vez. */
export const MAX_BULK_SESSIONS = 60

function parseDate(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { y, m, d }
}

export function weekdayOf(dateStr: string): number {
  const { y, m, d } = parseDate(dateStr)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function addDays(dateStr: string, days: number): string {
  const { y, m, d } = parseDate(dateStr)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/** Convierte una fecha y hora de Bogotá al instante UTC equivalente. */
export function bogotaToUtcIso(dateStr: string, timeStr: string): string {
  const { y, m, d } = parseDate(dateStr)
  const [hh, mm] = timeStr.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh + BOGOTA_UTC_OFFSET_HOURS, mm)).toISOString()
}

export interface GenerateDatesInput {
  startDate: string // 'YYYY-MM-DD'
  weekdays: number[] // 0 = domingo … 6 = sábado
  count: number
}

/**
 * Devuelve las primeras `count` fechas, a partir de `startDate` (inclusive),
 * que caigan en alguno de los días de la semana seleccionados.
 */
export function generateDates({ startDate, weekdays, count }: GenerateDatesInput): string[] {
  if (!startDate || weekdays.length === 0 || count <= 0) return []

  const dates: string[] = []
  let cursor = startDate
  // Tope de seguridad: dos años de búsqueda. Sin esto, un arreglo de días vacío
  // o una cuenta imposible dejaría el ciclo corriendo para siempre.
  const maxScanDays = 730

  for (let i = 0; i < maxScanDays && dates.length < count; i++) {
    if (weekdays.includes(weekdayOf(cursor))) dates.push(cursor)
    cursor = addDays(cursor, 1)
  }

  return dates
}

export function formatDateLabel(dateStr: string): string {
  const { y, m, d } = parseDate(dateStr)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}
