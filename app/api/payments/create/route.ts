import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateWompiSignature, pesosToWompiCents } from '@/lib/wompi'
import { getPlan, isValidPlanId } from '@/lib/plans'
import { resolveBestDiscount } from '@/lib/payments'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { courseId, childId, planId, referralCode } = (await request.json()) as {
    courseId: string
    childId: string
    planId: string
    referralCode?: string
  }
  if (!courseId || !childId || !planId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (!isValidPlanId(planId)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const plan = getPlan(planId)
  if (!plan) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // El hijo debe pertenecer al padre autenticado
  const { data: child } = await admin
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .single()

  if (!child) {
    return NextResponse.json({ error: 'Hijo no encontrado' }, { status: 404 })
  }

  const { data: course } = await admin
    .from('courses')
    .select('id, currency')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }

  // El precio SIEMPRE se lee del servidor, nunca del cliente: quien llama esta
  // ruta solo escoge qué plan quiere, no cuánto cuesta.
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

  // Reutiliza una inscripción pendiente si ya existe, en vez de duplicar
  const { data: existingEnrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', childId)
    .eq('course_id', courseId)
    .eq('status', 'pending_payment')
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

  // Si la familia había dejado una inscripción pendiente con otro plan y ahora
  // escoge uno distinto, mandan los datos de esta compra.
  if (existingEnrollment?.id) {
    await admin
      .from('enrollments')
      .update({ plan_id: planId, classes_purchased: plan.classes })
      .eq('id', existingEnrollment.id)
  }

  // --- Descuento de referidos: $50.000 para el que refiere y para el
  // referido. Dos fuentes posibles, en este orden de prioridad:
  //   1. Un crédito propio ya ganado (de haber referido a alguien antes).
  //   2. Un código de otro padre, solo válido en el primer pago aprobado
  //      de esta cuenta (evita reusar códigos repetidamente).
  const fullAmountInCents = pesosToWompiCents(planPrice.price)

  const { discountCents, referredByCode, referrerParentId, consumedCreditId, reason } =
    await resolveBestDiscount(admin, user.id, childId, fullAmountInCents, referralCode)

  const amountInCents = Math.max(fullAmountInCents - discountCents, 0)
  const currency = course.currency || 'COP'
  const reference = `INV-${enrollmentId}-${Date.now()}`

  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .insert({
      enrollment_id: enrollmentId,
      parent_id: user.id,
      reference,
      amount_in_cents: amountInCents,
      currency,
      status: 'PENDING',
      discount_cents: discountCents,
      discount_reason: reason,
      referred_by_code: referredByCode,
      referrer_parent_id: referrerParentId,
      consumed_credit_id: consumedCreditId,
    })
    .select('id')
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'No se pudo crear el pago' }, { status: 500 })
  }

  const signature = generateWompiSignature(reference, amountInCents, currency)

  return NextResponse.json({
    reference,
    amountInCents,
    currency,
    signature,
    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    discountCents,
    discountReason: reason,
    planId,
    planName: plan.name,
    classes: plan.classes,
  })
}
