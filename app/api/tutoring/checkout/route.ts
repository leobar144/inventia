import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateWompiSignature, pesosToWompiCents } from '@/lib/wompi'
import { resolveTutoringDiscount } from '@/lib/payments'
import { membershipEndDate } from '@/lib/homework'

/** Hoy en Bogotá (UTC-5 todo el año), en formato YYYY-MM-DD. */
function todayInBogota(): string {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/**
 * Compra de una mensualidad de Sala de Tareas.
 *
 * Es el gemelo de /api/payments/create, pero contra `tutoring_memberships` en
 * vez de `enrollments`. El pago entra en la MISMA tabla `payments`: la caja de
 * INVENTIA es una sola, o el panel de métricas empieza a mentir.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { childId, planId, referralCode } = (await request.json()) as {
    childId?: string
    planId?: string
    referralCode?: string
  }

  if (!childId || !planId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .single()

  if (!child) {
    return NextResponse.json({ error: 'Hijo no encontrado' }, { status: 404 })
  }

  // El precio SIEMPRE se lee del servidor. Quien llama escoge qué plan quiere,
  // no cuánto cuesta.
  const { data: plan } = await admin
    .from('tutoring_plans')
    .select('id, name, sessions_included, price')
    .eq('id', planId)
    .eq('is_active', true)
    .maybeSingle()

  if (!plan) {
    return NextResponse.json({ error: 'Plan no disponible' }, { status: 404 })
  }

  // Un plan sin precio no se cobra. Es el caso real mientras INVENTIA define
  // cuánto vale la Sala de Tareas: antes que inventar una cifra, se manda la
  // conversación a WhatsApp.
  if (plan.price === null || plan.price <= 0) {
    return NextResponse.json(
      {
        error:
          'Todavía no tenemos el precio publicado. Escríbenos por WhatsApp y te lo confirmamos.',
      },
      { status: 409 }
    )
  }

  // Si ya hay una mensualidad vigente, no se vende otra encima: se renovaría
  // pagando dos veces el mismo mes.
  const today = todayInBogota()
  const { data: current } = await admin
    .from('tutoring_memberships')
    .select('id, ends_on')
    .eq('child_id', childId)
    .eq('status', 'active')
    .gte('ends_on', today)
    .maybeSingle()

  if (current) {
    return NextResponse.json(
      { error: `Este niño/a ya tiene la Sala de Tareas activa hasta el ${current.ends_on}.` },
      { status: 409 }
    )
  }

  // Se reutiliza una membresía pendiente en vez de acumular basura cada vez que
  // el papá abre el checkout y no termina de pagar.
  const { data: pending } = await admin
    .from('tutoring_memberships')
    .select('id')
    .eq('child_id', childId)
    .eq('status', 'pending_payment')
    .maybeSingle()

  const startsOn = today
  const endsOn = membershipEndDate(startsOn)

  const membershipId =
    pending?.id ??
    (
      await admin
        .from('tutoring_memberships')
        .insert({
          child_id: childId,
          plan_id: plan.id,
          status: 'pending_payment',
          sessions_included: plan.sessions_included,
          starts_on: startsOn,
          ends_on: endsOn,
        })
        .select('id')
        .single()
    ).data?.id

  if (!membershipId) {
    return NextResponse.json({ error: 'No se pudo crear la mensualidad' }, { status: 500 })
  }

  // Si había una pendiente con otro plan, manda lo que se está comprando ahora.
  if (pending?.id) {
    await admin
      .from('tutoring_memberships')
      .update({
        plan_id: plan.id,
        sessions_included: plan.sessions_included,
        starts_on: startsOn,
        ends_on: endsOn,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
  }

  const fullAmountInCents = pesosToWompiCents(plan.price)

  const { discountCents, referredByCode, referrerParentId, consumedCreditId, reason } =
    await resolveTutoringDiscount(admin, user.id, childId, fullAmountInCents, referralCode)

  const amountInCents = Math.max(fullAmountInCents - discountCents, 0)
  const currency = 'COP'
  const reference = `TAR-${membershipId}-${Date.now()}`

  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .insert({
      enrollment_id: null,
      tutoring_membership_id: membershipId,
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

  return NextResponse.json({
    reference,
    amountInCents,
    currency,
    signature: generateWompiSignature(reference, amountInCents, currency),
    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    discountCents,
    discountReason: reason,
    planId: plan.id,
    planName: plan.name,
    sessionsIncluded: plan.sessions_included,
    startsOn,
    endsOn,
  })
}
