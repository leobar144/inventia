/**
 * Sala de Tareas — lógica pura del acompañamiento en tareas escolares.
 *
 * Sin llamadas a red y sin Supabase: lo mismo sirve en el portal del acudiente,
 * en la vista del monitor y en la tarea diaria del cron.
 */

export const SALA_DE_TAREAS = {
  /** Nombre del producto. La URL sí es /asesoria-tareas, que es lo que la gente busca en Google. */
  name: 'Sala de Tareas',
  /** La promesa. Es lo único que nos diferencia de un profesor particular y de ChatGPT. */
  promise: 'No le hacemos la tarea. Le enseñamos a hacerla.',
  scheduleLabel: 'Lunes a viernes, 3:00 a 6:00 p.m.',
  ageRange: '7 a 16 años',
} as const

// ---------------------------------------------------------------------------
// Materias

export const SUBJECTS = [
  { id: 'matematicas', label: 'Matemáticas', icon: '🔢' },
  { id: 'espanol', label: 'Español', icon: '📖' },
  { id: 'ingles', label: 'Inglés', icon: '🌎' },
  { id: 'ciencias', label: 'Ciencias', icon: '🔬' },
  { id: 'sociales', label: 'Sociales', icon: '🗺️' },
  { id: 'fisica', label: 'Física', icon: '⚛️' },
  { id: 'quimica', label: 'Química', icon: '🧪' },
  { id: 'tecnologia', label: 'Tecnología', icon: '💻' },
  { id: 'otra', label: 'Otra', icon: '✏️' },
] as const

export type SubjectId = (typeof SUBJECTS)[number]['id']

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id)
}

export function subjectLabel(id: string): string {
  return getSubject(id)?.label ?? id
}

// ---------------------------------------------------------------------------
// Uso de inteligencia artificial
//
// Los colegios en Colombia pasaron de prohibir la IA a exigir que el alumno
// declare cómo la usó. Registrarlo no es una postura moral nuestra: es lo que
// el colegio va a pedir, anotado por un adulto que estaba ahí.
//
// Por eso las etiquetas describen QUÉ PASÓ, no si estuvo bien o mal. "La IA le
// hizo la tarea" es un dato para conversar con la familia, no una acusación —
// si se redacta como falta, el monitor deja de marcarlo y perdemos el dato.

export const AI_USE_OPTIONS = [
  {
    id: 'no',
    label: 'No usó IA',
    short: 'Sin IA',
    description: 'Resolvió con sus propios recursos.',
    tone: 'neutral',
    icon: '✋',
  },
  {
    id: 'consulta',
    label: 'Preguntó y entendió',
    short: 'Consultó',
    description: 'Usó la IA para entender un concepto y después lo aplicó solo.',
    tone: 'bueno',
    icon: '💡',
  },
  {
    id: 'verificacion',
    label: 'Verificó su trabajo',
    short: 'Verificó',
    description: 'Hizo la tarea y luego la revisó con IA. Es el uso que enseñamos.',
    tone: 'bueno',
    icon: '✅',
  },
  {
    id: 'la-hizo',
    label: 'La IA resolvió la tarea',
    short: 'La IA la hizo',
    description: 'Llegó con la tarea resuelta por IA o intentó resolverla así. Lo trabajamos en el momento.',
    tone: 'atencion',
    icon: '⚠️',
  },
] as const

export type AiUse = (typeof AI_USE_OPTIONS)[number]['id']

export function getAiUse(id: string) {
  return AI_USE_OPTIONS.find((o) => o.id === id)
}

export function isValidAiUse(value: string): value is AiUse {
  return AI_USE_OPTIONS.some((o) => o.id === value)
}

// ---------------------------------------------------------------------------
// Detección de tema atascado
//
// Esto es lo que ningún profesor particular hace: notar el patrón. Un monitor
// distinto cada tarde no se acuerda de que el niño lleva tres semanas trabado
// en fracciones. El registro sí.
//
// Se detecta por MATERIA, no por el texto de `stuck_on`. Comparar texto libre
// escrito a la carrera ("fracciones", "las fracciones", "fraccionarios") daría
// falsos negativos todo el tiempo. La materia es un identificador estable, y el
// texto se muestra aparte como evidencia para que el papá lea el detalle real.

/** Cuántas tardes recientes se miran. */
export const STUCK_WINDOW = 5
/** Cuántas veces tiene que aparecer la materia trabada para avisar. */
export const STUCK_THRESHOLD = 3

export interface AttendanceForAnalysis {
  subjects: string[]
  stuck_on: string | null
  created_at: string
}

export interface StuckTopic {
  subjectId: string
  subjectLabel: string
  times: number
  /** Lo que el monitor escribió cada vez, de lo más reciente a lo más viejo. */
  notes: string[]
}

/**
 * Materias en las que el niño se viene atascando.
 *
 * `attendances` puede venir en cualquier orden: aquí se ordena y se recorta a
 * las últimas `STUCK_WINDOW` tardes.
 */
export function detectStuckTopics(attendances: AttendanceForAnalysis[]): StuckTopic[] {
  const recent = [...attendances]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, STUCK_WINDOW)

  const bySubject = new Map<string, string[]>()

  for (const a of recent) {
    const note = a.stuck_on?.trim()
    if (!note) continue

    for (const subjectId of a.subjects) {
      const notes = bySubject.get(subjectId) ?? []
      notes.push(note)
      bySubject.set(subjectId, notes)
    }
  }

  return [...bySubject.entries()]
    .filter(([, notes]) => notes.length >= STUCK_THRESHOLD)
    .map(([subjectId, notes]) => ({
      subjectId,
      subjectLabel: subjectLabel(subjectId),
      times: notes.length,
      notes,
    }))
    .sort((a, b) => b.times - a.times)
}

// ---------------------------------------------------------------------------
// Membresías

export interface TutoringPlanRow {
  id: string
  name: string
  /** 0 = no es un compromiso semanal, es una visita suelta. */
  sessions_per_week: number
  sessions_included: number
  /** `null` = todavía sin definir. No se puede cobrar. */
  price: number | null
}

/** Un plan sin precio no se puede vender: el checkout lo rechaza. */
export function isSellable(plan: Pick<TutoringPlanRow, 'price'>): boolean {
  return plan.price !== null && plan.price > 0
}

/** ¿Es la tarde suelta, en vez de un paquete mensual? */
export function isDropIn(plan: Pick<TutoringPlanRow, 'sessions_included'>): boolean {
  return plan.sessions_included <= 1
}

/**
 * Cómo se describe un plan sin nombrar el precio.
 *
 * Se usa en la página pública mientras los precios no estén definidos: el papá
 * tiene que poder entender QUÉ está comprando aunque todavía no sepa cuánto
 * cuesta, o la página no sirve para nada.
 */
export function planFrequencyLabel(
  plan: Pick<TutoringPlanRow, 'sessions_per_week' | 'sessions_included'>
): string {
  if (isDropIn(plan)) return 'Una sola tarde, sin mensualidad'
  return `${plan.sessions_included} tardes al mes`
}

/**
 * Lo que aporta un niño por cada tarde que asiste, según su plan.
 *
 * Un plan sin precio aporta 0: no es que la tarde sea gratis, es que todavía no
 * se ha vendido ninguna a ese plan. El panel de margen lo refleja tal cual en
 * vez de inventar un ingreso.
 */
export function revenuePerAttendance(
  plan: Pick<TutoringPlanRow, 'price' | 'sessions_included'>
): number {
  if (plan.price === null || plan.sessions_included <= 0) return 0
  return Math.round(plan.price / plan.sessions_included)
}

export interface MembershipProgress {
  used: number
  included: number
  remaining: number
  percent: number
  daysLeft: number
  /** Quedan pocas tardes o pocos días: es el momento de ofrecer la renovación. */
  needsRenewal: boolean
}

export function getMembershipProgress(
  sessionsIncluded: number,
  attendancesUsed: number,
  endsOn: string,
  today = new Date()
): MembershipProgress {
  const used = Math.min(attendancesUsed, sessionsIncluded)
  const remaining = Math.max(sessionsIncluded - attendancesUsed, 0)

  // Solo la fecha, sin hora: comparar con hora convertiría "vence hoy" en
  // "venció ayer" según a qué hora se abra el portal.
  const end = new Date(`${endsOn}T00:00:00-05:00`)
  const startOfToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  )
  const daysLeft = Math.ceil((end.getTime() - startOfToday.getTime()) / 86_400_000)

  return {
    used,
    included: sessionsIncluded,
    remaining,
    percent: sessionsIncluded > 0 ? Math.round((used / sessionsIncluded) * 100) : 0,
    daysLeft,
    needsRenewal: remaining <= 2 || daysLeft <= 5,
  }
}

/**
 * Última fecha cubierta por una mensualidad que arranca en `startsOn`.
 *
 * No se usa `setUTCMonth(+1)` porque DESBORDA: el 31 de enero más un mes cae en
 * marzo (febrero no tiene 31), y la familia se quedaba con un mes de más sin
 * pagarlo. Cuando el día de inicio no existe en el mes siguiente, la
 * mensualidad termina el último día de ese mes.
 */
export function membershipEndDate(startsOn: string): string {
  const [y, m, d] = startsOn.split('-').map(Number)

  // `Date.UTC(y, m + 1, 0)` es el día 0 del mes subsiguiente, o sea el último
  // del siguiente — `m` viene en base 1, así que ya está corrido uno.
  const lastDayOfNextMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()

  const end =
    d > lastDayOfNextMonth
      ? new Date(Date.UTC(y, m, lastDayOfNextMonth))
      : new Date(Date.UTC(y, m, d - 1))

  return end.toISOString().slice(0, 10)
}
