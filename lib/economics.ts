/**
 * Modelo de costos de INVENTIA. Es la base del panel de ocupación de grupos.
 *
 * Si alguno de estos números cambia (le subes al profesor, cambias la duración
 * de la clase, contratas más gente fija), actualízalo AQUÍ y todo el panel se
 * recalcula solo.
 *
 * Datos vigentes a agosto de 2026.
 */

/** Lo que se le paga al instructor por hora dictada. */
export const INSTRUCTOR_HOURLY_COP = 80_000

/** Duración por defecto de una clase, en horas. */
export const CLASS_HOURS = 2

/**
 * Costo del instructor por clase dictada. NO depende de cuántos niños haya —
 * por eso el llenado del grupo es lo que determina el margen.
 *
 * La duración varía por curso: Exploradores (4-6 años) dura 1 hora porque a esa
 * edad no da la atención para más, el resto dura 2. Por eso se lee de
 * `courses.class_hours` en vez de asumir un valor único.
 */
export function instructorCostPerClass(classHours: number = CLASS_HOURS): number {
  return INSTRUCTOR_HOURLY_COP * classHours
}

/** Costo de una clase estándar de 2 horas. */
export const INSTRUCTOR_COST_PER_CLASS = instructorCostPerClass()

/**
 * Costo mensual de la coordinadora: salario mínimo 2026 ($1.750.905) más
 * auxilio de transporte y prestaciones de ley. Es un costo FIJO: no cambia con
 * el número de alumnos, y por eso hay un mínimo de alumnos para no perder.
 */
export const COORDINATOR_MONTHLY_COP = 2_900_000

/** Comisión efectiva de Wompi: 2,65% + $700 + IVA. */
export const PAYMENT_FEE_RATE = 0.034

/** Cupos por grupo. */
export const MAX_STUDENTS_PER_GROUP = 8

/**
 * Cuántos grupos simultáneos se pueden sostener hoy con el equipo disponible.
 * Sirve para saber si una solicitud institucional cabe o hay que contratar
 * antes de comprometerse. Súbelo cuando entren más instructores.
 */
export const MAX_CONCURRENT_GROUPS = 4

/** Estudiantes que se pueden atender al tiempo con el equipo actual. */
export const CURRENT_STUDENT_CAPACITY = MAX_CONCURRENT_GROUPS * MAX_STUDENTS_PER_GROUP

export type OccupancyHealth = 'sano' | 'justo' | 'critico'

export interface CourseEconomics {
  students: number
  maxStudents: number
  /** Ingreso por clase dictada, sumando lo que aporta cada niño según su plan. */
  revenuePerClass: number
  costPerClass: number
  /**
   * Lo que cuesta dictar una clase de este curso, haya o no alumnos. Se expone
   * aparte de `costPerClass` (que es 0 sin alumnos) porque es justo el dato que
   * hay que mostrar cuando el grupo está vacío.
   */
  instructorCostIfRun: number
  marginPerClass: number
  marginPercent: number
  health: OccupancyHealth
  /** Cuántos niños faltan para que el grupo deje de perder plata. */
  studentsToBreakEven: number
}

export function classifyHealth(marginPercent: number): OccupancyHealth {
  if (marginPercent >= 50) return 'sano'
  if (marginPercent >= 25) return 'justo'
  return 'critico'
}

/**
 * Economía real de un grupo, a partir de lo que efectivamente aporta cada niño.
 *
 * `revenuePerStudentPerClass` viene de dividir el precio del plan que compró
 * cada familia entre las clases que cubre — no de un promedio inventado.
 */
export function computeCourseEconomics(
  revenuePerStudentPerClass: number[],
  maxStudents: number,
  classHours: number = CLASS_HOURS
): CourseEconomics {
  const students = revenuePerStudentPerClass.length
  const grossPerClass = revenuePerStudentPerClass.reduce((sum, r) => sum + r, 0)
  // El ingreso se cuenta después de la comisión de la pasarela: esa plata nunca
  // llegó a la caja.
  const revenuePerClass = grossPerClass * (1 - PAYMENT_FEE_RATE)
  const costPerClass = students > 0 ? instructorCostPerClass(classHours) : 0
  const marginPerClass = revenuePerClass - costPerClass
  const marginPercent = revenuePerClass > 0 ? (marginPerClass / revenuePerClass) * 100 : 0

  // Cuántos niños más se necesitan para cubrir al instructor, asumiendo que
  // aportan lo mismo que el promedio actual del grupo.
  const avgPerStudent = students > 0 ? revenuePerClass / students : 0
  const studentsToBreakEven =
    marginPerClass >= 0 || avgPerStudent <= 0
      ? 0
      : Math.ceil(-marginPerClass / avgPerStudent)

  return {
    students,
    maxStudents,
    revenuePerClass,
    costPerClass,
    instructorCostIfRun: instructorCostPerClass(classHours),
    marginPerClass,
    marginPercent,
    health: students === 0 ? 'critico' : classifyHealth(marginPercent),
    studentsToBreakEven,
  }
}

// ---------------------------------------------------------------------------
// Sala de Tareas
//
// Economía distinta a la de los cursos, y por eso va aparte: el monitor de
// tareas no es un instructor STEM. Acompañar tareas de colegio lo hace bien un
// estudiante de licenciatura o de ingeniería; pagarle $80.000/hora vuelve el
// negocio inviable (con 8 niños el bloque PIERDE plata, y con 12 deja apenas
// 28%, que no aguanta una tarde con inasistencias).

/** Lo que se le paga al monitor de la Sala de Tareas por hora. */
export const MONITOR_HOURLY_COP = 40_000

/** Duración de un bloque de tarde, en horas (3:00 a 6:00 p.m.). */
export const TUTORING_BLOCK_HOURS = 3

/**
 * Cupo de una tarde PRESENCIAL. Más alto que el de los cursos (8) porque el
 * monitor no está dictando: está acompañando a niños que trabajan en lo suyo.
 * El tope real lo pone el salón, no la pedagogía.
 *
 * Las tardes virtuales no tienen cupo (`capacity = null`): no hay sillas que se
 * acaben. Pero sí tienen un límite de atención — ver `MONITOR_ATTENTION_LIMIT`.
 */
export const TUTORING_BLOCK_CAPACITY = 12

/**
 * Cuántos niños puede acompañar DE VERDAD un monitor en una tarde.
 *
 * No es un tope que el sistema imponga: una tarde virtual admite los que
 * lleguen. Es el número a partir del cual el panel avisa que hace falta un
 * segundo monitor, porque el producto que vendemos no es "un adulto conectado"
 * sino que a cada niño le pregunten antes de responderle y le escriban su
 * bitácora. Con 12 niños en 3 horas son 15 minutos por niño; con 24 son 7, y
 * ahí ya no se está prestando el servicio que se cobró.
 */
export const MONITOR_ATTENTION_LIMIT = 12

/** Costo del monitor por bloque dictado. No depende de cuántos niños lleguen. */
export function monitorCostPerBlock(blockHours: number = TUTORING_BLOCK_HOURS): number {
  return MONITOR_HOURLY_COP * blockHours
}

export interface TutoringBlockEconomics {
  attendees: number
  /** `null` = sin límite (tardes virtuales). */
  capacity: number | null
  revenuePerBlock: number
  costPerBlock: number
  /** Lo que cuesta abrir la sala, lleguen o no niños. */
  monitorCostIfRun: number
  marginPerBlock: number
  marginPercent: number
  health: OccupancyHealth
  /** Cuántos niños más se necesitan para que la tarde no pierda plata. */
  attendeesToBreakEven: number
  /** Hay más niños de los que un solo monitor alcanza a acompañar. */
  needsSecondMonitor: boolean
}

/**
 * Economía de una tarde de sala.
 *
 * `revenuePerAttendee` viene de dividir el plan de cada familia entre las
 * tardes que cubre (ver `revenuePerAttendance` en lib/homework.ts) — mismo
 * criterio que en los cursos, nunca un promedio inventado.
 */
export function computeTutoringBlockEconomics(
  revenuePerAttendee: number[],
  capacity: number | null = TUTORING_BLOCK_CAPACITY,
  blockHours: number = TUTORING_BLOCK_HOURS
): TutoringBlockEconomics {
  const attendees = revenuePerAttendee.length
  const gross = revenuePerAttendee.reduce((sum, r) => sum + r, 0)
  const revenuePerBlock = gross * (1 - PAYMENT_FEE_RATE)
  const monitorCostIfRun = monitorCostPerBlock(blockHours)
  const costPerBlock = attendees > 0 ? monitorCostIfRun : 0
  const marginPerBlock = revenuePerBlock - costPerBlock
  const marginPercent = revenuePerBlock > 0 ? (marginPerBlock / revenuePerBlock) * 100 : 0

  const avgPerAttendee = attendees > 0 ? revenuePerBlock / attendees : 0
  const attendeesToBreakEven =
    marginPerBlock >= 0 || avgPerAttendee <= 0 ? 0 : Math.ceil(-marginPerBlock / avgPerAttendee)

  return {
    attendees,
    capacity,
    revenuePerBlock,
    costPerBlock,
    monitorCostIfRun,
    marginPerBlock,
    marginPercent,
    health: attendees === 0 ? 'critico' : classifyHealth(marginPercent),
    attendeesToBreakEven,
    needsSecondMonitor: attendees > MONITOR_ATTENTION_LIMIT,
  }
}
