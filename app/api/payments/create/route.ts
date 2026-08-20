import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateWompiSignature, pesosToWompiCents } from '@/lib/wompi'

const REFERRAL_DISCOUNT_CENTS = 5_000_000 // $50.000 COP

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { courseId, childId, referralCode } = (await request.json()) as {
    courseId: string
    childId: string
    referralCode?: string
  }
  if (!courseId || !childId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
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
    .select('id, price, currency')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
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
        .insert({ student_id: childId, course_id: courseId, status: 'pending_payment', progress: 0 })
        .select('id')
        .single()
    ).data?.id

  if (!enrollmentId) {
    return NextResponse.json({ error: 'No se pudo crear la inscripción' }, { status: 500 })
  }

  // --- Descuento de referidos: $50.000 para el que refiere y para el
  // referido. Dos fuentes posibles, en este orden de prioridad:
  //   1. Un crédito propio ya ganado (de haber referido a alguien antes).
  //   2. Un código de otro padre, solo válido en el primer pago aprobado
  //      de esta cuenta (evita reusar códigos repetidamente).
  let discountCents = 0
  let referredByCode: string | null = null
  let referrerParentId: string | null = null
  let consumedCreditId: string | null = null

  const { data: ownCredit } = await admin
    .from('referral_credits')
    .select('id, amount_cents')
    .eq('referrer_parent_id', user.id)
    .eq('used', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ownCredit) {
    discountCents = ownCredit.amount_cents
    consumedCreditId = ownCredit.id
  } else if (referralCode?.trim()) {
    const code = referralCode.trim().toUpperCase()

    const { count: priorApprovedCount } = await admin
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', user.id)
      .eq('status', 'APPROVED')

    if (!priorApprovedCount || priorApprovedCount === 0) {
      const { data: parentProfiles } = await admin.from('profiles').select('id').eq('role', 'parent')
      const referrer = (parentProfiles ?? []).find(
        (p) => p.id.slice(0, 8).toUpperCase() === code && p.id !== user.id
      )

      if (referrer) {
        discountCents = REFERRAL_DISCOUNT_CENTS
        referredByCode = code
        referrerParentId = referrer.id
      }
    }
  }

  const fullAmountInCents = pesosToWompiCents(course.price)
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
  })
}
