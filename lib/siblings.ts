/**
 * Descuento por hermano.
 *
 * Un acudiente que ya tiene un hijo activo recibe un descuento al inscribir al
 * siguiente. Es la venta más fácil que existe: ya confía en INVENTIA, ya sabe
 * cómo funciona, y no hay costo de adquisición.
 *
 * Para cambiar el porcentaje basta con tocar esta constante — se recalcula solo
 * en el checkout, en el registro manual de pagos y en lo que ve el padre.
 */
export const SIBLING_DISCOUNT_PERCENT = 15

/** Descuento en centavos sobre el precio de lista. */
export function siblingDiscountCents(fullAmountCents: number): number {
  return Math.round(fullAmountCents * (SIBLING_DISCOUNT_PERCENT / 100))
}
