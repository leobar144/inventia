/**
 * Política de clases de recuperación.
 *
 * Un niño se enferma y pierde la clase. Si simplemente la pierde, el papá pagó
 * 12 clases y recibió 11 — y esa es la queja que termina en cancelación. Pero
 * cada recuperación ocupa un cupo de un grupo de 8 que podrías estar vendiendo,
 * así que no puede ser ilimitada.
 *
 * Reglas acordadas con el negocio:
 *   - 1 recuperación por cada 4 clases compradas (Mes 1, Trimestre 3, Semestre 6).
 *     Proporcional a lo que pagó, y nadie puede faltar sistemáticamente.
 *   - 30 días desde la clase perdida para usarla. Evita que se acumulen
 *     recuperaciones viejas que descuadren los grupos.
 *   - La agenda el acudiente desde el portal, sin intervención del equipo.
 */

export const CLASSES_PER_MAKEUP = 4
export const MAKEUP_WINDOW_DAYS = 30

/** Cuántas recuperaciones da un plan, según las clases que cubre. */
export function makeupAllowance(classesPurchased: number | null | undefined): number {
  return Math.floor((classesPurchased ?? 0) / CLASSES_PER_MAKEUP)
}

/** Si una clase perdida todavía está dentro del plazo para recuperarse. */
export function isWithinMakeupWindow(missedAt: string, now: Date = new Date()): boolean {
  const missed = new Date(missedAt).getTime()
  const elapsedDays = (now.getTime() - missed) / (1000 * 60 * 60 * 24)
  return elapsedDays >= 0 && elapsedDays <= MAKEUP_WINDOW_DAYS
}

/** Días que quedan para reclamar una clase perdida. Nunca negativo. */
export function daysLeftToClaim(missedAt: string, now: Date = new Date()): number {
  const missed = new Date(missedAt).getTime()
  const elapsedDays = (now.getTime() - missed) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(MAKEUP_WINDOW_DAYS - elapsedDays))
}
