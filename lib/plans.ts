import { PRICING_PLANS } from './constants'

/**
 * Los planes definen CUÁNTAS clases compra la familia. El curso define QUÉ
 * estudia el niño. El precio vive en la combinación de ambos, en la tabla
 * `course_plan_prices` — nunca en el código.
 *
 * `PRICING_PLANS` (lib/constants.ts) sigue siendo la definición estructural
 * única: nombre, número de clases, nivel, qué desbloquea. Su campo `price` es
 * solo el precio base de referencia que muestra la página de marketing cuando
 * no hay un curso seleccionado todavía.
 */
export type PlanId = 'mes' | 'trimestre' | 'semestre'

export const PLAN_IDS: PlanId[] = ['mes', 'trimestre', 'semestre']

export type Plan = (typeof PRICING_PLANS)[number]

export function getPlan(planId: string): Plan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId)
}

export function isValidPlanId(planId: string): planId is PlanId {
  return PLAN_IDS.includes(planId as PlanId)
}

/** Orden de presentación: del compromiso más corto al más largo. */
export function sortByPlanOrder<T extends { plan_id: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => PLAN_IDS.indexOf(a.plan_id as PlanId) - PLAN_IDS.indexOf(b.plan_id as PlanId)
  )
}
