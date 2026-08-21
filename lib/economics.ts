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

/** Duración de una clase, en horas. */
export const CLASS_HOURS = 2

/**
 * Costo del instructor por clase dictada. NO depende de cuántos niños haya —
 * por eso el llenado del grupo es lo que determina el margen.
 */
export const INSTRUCTOR_COST_PER_CLASS = INSTRUCTOR_HOURLY_COP * CLASS_HOURS

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
  maxStudents: number
): CourseEconomics {
  const students = revenuePerStudentPerClass.length
  const grossPerClass = revenuePerStudentPerClass.reduce((sum, r) => sum + r, 0)
  // El ingreso se cuenta después de la comisión de la pasarela: esa plata nunca
  // llegó a la caja.
  const revenuePerClass = grossPerClass * (1 - PAYMENT_FEE_RATE)
  const costPerClass = students > 0 ? INSTRUCTOR_COST_PER_CLASS : 0
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
    marginPerClass,
    marginPercent,
    health: students === 0 ? 'critico' : classifyHealth(marginPercent),
    studentsToBreakEven,
  }
}
