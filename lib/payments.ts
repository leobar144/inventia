import type { createServiceRoleClient } from './supabase/server'
import { siblingDiscountCents } from './siblings'

type AdminClient = ReturnType<typeof createServiceRoleClient>

/** Descuento de referido: $50.000 COP, para quien refiere y para el referido. */
export const REFERRAL_DISCOUNT_CENTS = 5_000_000

export const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'transferencia', label: 'Transferencia bancaria' },
  { id: 'nequi', label: 'Nequi' },
  { id: 'daviplata', label: 'Daviplata' },
  { id: 'datafono', label: 'Datáfono' },
  { id: 'otro', label: 'Otro' },
] as const

export type ManualPaymentMethod = (typeof PAYMENT_METHODS)[number]['id']

export function isManualPaymentMethod(value: string): value is ManualPaymentMethod {
  return PAYMENT_METHODS.some((m) => m.id === value)
}

export interface ReferralOutcome {
  discountCents: number
  referredByCode: string | null
  referrerParentId: string | null
  consumedCreditId: string | null
}

/**
 * Resuelve qué descuento de referido le corresponde a un padre, en este orden:
 *   1. Un crédito propio ya ganado por haber referido a alguien antes.
 *   2. El código de otro padre — solo válido en el primer pago aprobado de esta
 *      cuenta, para que un código no se pueda reusar indefinidamente.
 *
 * No escribe nada: solo calcula. El crédito se acredita o se consume cuando el
 * pago queda realmente aprobado (ver applyApprovedPayment).
 */
export async function resolveReferralDiscount(
  admin: AdminClient,
  parentId: string,
  referralCode?: string
): Promise<ReferralOutcome> {
  const none: ReferralOutcome = {
    discountCents: 0,
    referredByCode: null,
    referrerParentId: null,
    consumedCreditId: null,
  }

  const { data: ownCredit } = await admin
    .from('referral_credits')
    .select('id, amount_cents')
    .eq('referrer_parent_id', parentId)
    .eq('used', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ownCredit) {
    return {
      discountCents: ownCredit.amount_cents,
      referredByCode: null,
      referrerParentId: null,
      consumedCreditId: ownCredit.id,
    }
  }

  if (!referralCode?.trim()) return none

  const code = referralCode.trim().toUpperCase()

  const { count: priorApprovedCount } = await admin
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId)
    .eq('status', 'APPROVED')

  if (priorApprovedCount && priorApprovedCount > 0) return none

  // El código son los primeros 8 caracteres del id de quien refiere. Se compara
  // en JS en vez de en SQL para no depender de un cast sobre una columna uuid.
  //
  // No se filtra por rol a propósito: antes solo se buscaba entre role='parent',
  // así que el código de la dueña (role='admin') nunca encontraba coincidencia y
  // su recomendación silenciosamente no daba descuento. Cualquiera con cuenta
  // puede referir; lo único que no se permite es referirse a uno mismo.
  const { data: profiles } = await admin.from('profiles').select('id')
  const referrer = (profiles ?? []).find(
    (p) => p.id.slice(0, 8).toUpperCase() === code && p.id !== parentId
  )

  if (!referrer) return none

  return {
    discountCents: REFERRAL_DISCOUNT_CENTS,
    referredByCode: code,
    referrerParentId: referrer.id,
    consumedCreditId: null,
  }
}

/**
 * ¿Este acudiente ya tiene OTRO hijo inscrito y activo?
 *
 * Se exige que el hermano esté 'active' o 'completed' — es decir, que haya un
 * pago aprobado detrás. Una inscripción en 'pending_payment' no habilita el
 * descuento: si no, bastaría con abrir dos checkouts al tiempo para que el
 * segundo se descontara sin que el primero se haya pagado nunca.
 */
export async function hasEnrolledSibling(
  admin: AdminClient,
  parentId: string,
  childId: string
): Promise<boolean> {
  const { data: siblings } = await admin
    .from('children')
    .select('id')
    .eq('parent_id', parentId)
    .neq('id', childId)

  if (!siblings || siblings.length === 0) return false

  const { count } = await admin
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .in(
      'student_id',
      siblings.map((s) => s.id)
    )
    .in('status', ['active', 'completed'])

  return (count ?? 0) > 0
}

export interface AppliedDiscount extends ReferralOutcome {
  reason: 'referido' | 'hermano' | null
}

/**
 * Decide qué descuento se aplica a este pago.
 *
 * Nunca se suman: se toma el MAYOR entre el de referido y el de hermano.
 * Acumularlos podía llegar a ~30% sobre el plan y comerse el margen del grupo.
 */
export async function resolveBestDiscount(
  admin: AdminClient,
  parentId: string,
  childId: string,
  fullAmountCents: number,
  referralCode?: string
): Promise<AppliedDiscount> {
  const [referral, siblingApplies] = await Promise.all([
    resolveReferralDiscount(admin, parentId, referralCode),
    hasEnrolledSibling(admin, parentId, childId),
  ])

  const siblingCents = siblingApplies ? siblingDiscountCents(fullAmountCents) : 0

  if (siblingCents > referral.discountCents) {
    return {
      discountCents: siblingCents,
      referredByCode: null,
      referrerParentId: null,
      consumedCreditId: null,
      reason: 'hermano',
    }
  }

  return {
    ...referral,
    reason: referral.discountCents > 0 ? 'referido' : null,
  }
}

export interface ApprovablePayment {
  id: string
  enrollment_id: string
  referrer_parent_id: string | null
  consumed_credit_id: string | null
}

/**
 * Efectos de un pago aprobado: activar la inscripción y liquidar los referidos.
 *
 * Vive aquí —y no dentro del webhook— porque hay dos caminos por los que un pago
 * puede quedar aprobado (Wompi y registro manual del administrador) y deben
 * hacer exactamente lo mismo. Duplicar esta lógica es cómo se desincronizan.
 */
export async function applyApprovedPayment(
  admin: AdminClient,
  payment: ApprovablePayment
): Promise<void> {
  await admin
    .from('enrollments')
    .update({ status: 'active', enrolled_date: new Date().toISOString() })
    .eq('id', payment.enrollment_id)

  // Los créditos solo se mueven con plata realmente cobrada, nunca antes.
  if (payment.referrer_parent_id) {
    await admin.from('referral_credits').insert({
      referrer_parent_id: payment.referrer_parent_id,
      source_payment_id: payment.id,
    })
  }

  if (payment.consumed_credit_id) {
    await admin
      .from('referral_credits')
      .update({ used: true, used_payment_id: payment.id })
      .eq('id', payment.consumed_credit_id)
  }
}
