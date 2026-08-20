import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getPlan, isValidPlanId } from '@/lib/plans'
import {
  applyApprovedPayment,
  isManualPaymentMethod,
  resolveReferralDiscount,
} from '@/lib/payments'
import { pesosToWompiCents } from '@/lib/wompi'

/**
 * Registra un pago recibido por fuera de Wompi (efectivo, transferencia, Nequi,
 * datáfono) y activa la inscripción igual que lo haría el webhook.
 *
 * Solo para rol 'admin': un instructor puede marcar asistencia, pero no puede
 * declarar que entró plata. Queda registrado quién lo hizo (recorded_by).
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { childId, courseId, planId, method, amount, referralCode, notes } =
    (await request.json()) as {
      childId: string
      courseId: string
      planId: string
      method: string
      amount?: number
      referralCode?: string
      notes?: string
    }

  if (!childId || !courseId || !planId || !method) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (!isValidPlanId(planId)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  if (!isManualPaymentMethod(method)) {
    return NextResponse.json({ error: 'Medio de pago inválido' }, { status: 400 })
  }

  const plan = getPlan(planId)
  if (!plan) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id, full_name, parent_id')
    .eq('id', childId)
    .single()

  if (!child) {
    return NextResponse.json({ error: 'Niño/a no encontrado' }, { status: 404 })
  }

  const { data: course } = await admin
    .from('courses')
    .select('id, currency')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }

  const { data: planPrice } = await admin
    .from('course_plan_prices')
    .select('price')
    .eq('course_id', courseId)
    .eq('plan_id', planId)
    .eq('is_active', true)
    .maybeSingle()

  if (!planPrice) {
    return NextResponse.json(
      { error: 'Ese plan no está disponible para este curso' },
      { status: 404 }
    )
  }

  const referral = await resolveReferralDiscount(admin, child.parent_id, referralCode)

  // El administrador puede registrar un monto distinto al de lista (un acuerdo
  // puntual, un abono). Si no manda nada, se cobra el precio del plan menos el
  // descuento de referido que corresponda.
  const listAmountCents = pesosToWompiCents(planPrice.price)
  const defaultAmountCents = Math.max(listAmountCents - referral.discountCents, 0)
  const amountInCents =
    amount != null && amount >= 0 ? pesosToWompiCents(amount) : defaultAmountCents

  const { data: existingEnrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', childId)
    .eq('course_id', courseId)
    .in('status', ['pending_payment', 'active'])
    .maybeSingle()

  const enrollmentId =
    existingEnrollment?.id ??
    (
      await admin
        .from('enrollments')
        .insert({
          student_id: childId,
          course_id: courseId,
          status: 'pending_payment',
          progress: 0,
          plan_id: planId,
          classes_purchased: plan.classes,
        })
        .select('id')
        .single()
    ).data?.id

  if (!enrollmentId) {
    return NextResponse.json({ error: 'No se pudo crear la inscripción' }, { status: 500 })
  }

  if (existingEnrollment?.id) {
    await admin
      .from('enrollments')
      .update({ plan_id: planId, classes_purchased: plan.classes })
      .eq('id', existingEnrollment.id)
  }

  const reference = `MAN-${enrollmentId}-${Date.now()}`

  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .insert({
      enrollment_id: enrollmentId,
      parent_id: child.parent_id,
      reference,
      amount_in_cents: amountInCents,
      currency: course.currency || 'COP',
      status: 'APPROVED',
      payment_method: method,
      recorded_by: user.id,
      notes: notes?.trim() || null,
      discount_cents: referral.discountCents,
      referred_by_code: referral.referredByCode,
      referrer_parent_id: referral.referrerParentId,
      consumed_credit_id: referral.consumedCreditId,
    })
    .select('id, enrollment_id, referrer_parent_id, consumed_credit_id')
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'No pudimos registrar el pago' }, { status: 500 })
  }

  await applyApprovedPayment(admin, payment)

  return NextResponse.json({
    success: true,
    childName: child.full_name,
    amount: amountInCents / 100,
    discountApplied: referral.discountCents / 100,
  })
}
