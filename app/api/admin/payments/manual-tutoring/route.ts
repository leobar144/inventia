import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { applyApprovedPayment, isManualPaymentMethod } from '@/lib/payments'
import { membershipEndDate, todayInBogota } from '@/lib/homework'
import { pesosToWompiCents } from '@/lib/wompi'

/**
 * Registra un pago de la Sala de Tareas recibido por fuera de Wompi (efectivo,
 * transferencia, Nequi, datáfono) y activa la mensualidad, igual que haría el
 * webhook con un pago en línea.
 *
 * Va aparte de /api/admin/payments/manual porque esa ruta cobra contra un CURSO
 * —precio en `course_plan_prices`, inscripción en `enrollments`— y esta cobra
 * contra una mensualidad. El pago entra en la misma tabla `payments`: la caja
 * de INVENTIA es una sola.
 *
 * Aquí el monto es OBLIGATORIO. Los planes de la Sala de Tareas tienen precio
 * nulo a propósito mientras no se publiquen, así que no hay precio de lista del
 * que partir: lo escribe quien registra el pago.
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

  // Igual que con los cursos: un instructor puede registrar la tarde, pero no
  // puede declarar que entró plata.
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    childId?: string
    planId?: string
    method?: string
    amount?: number
    startsOn?: string
    notes?: string
  }

  const { childId, planId, method, amount, startsOn, notes } = body

  if (!childId || !planId || !method) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (!isManualPaymentMethod(method)) {
    return NextResponse.json({ error: 'Medio de pago inválido' }, { status: 400 })
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: 'Escribe el monto recibido: los planes de la Sala de Tareas no tienen precio publicado.' },
      { status: 400 }
    )
  }

  if (startsOn && !/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) {
    return NextResponse.json({ error: 'Fecha de inicio inválida' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id, full_name, parent_id')
    .eq('id', childId)
    .maybeSingle()

  if (!child) {
    return NextResponse.json({ error: 'Niño/a no encontrado' }, { status: 404 })
  }

  const { data: plan } = await admin
    .from('tutoring_plans')
    .select('id, name, sessions_included')
    .eq('id', planId)
    .eq('is_active', true)
    .maybeSingle()

  if (!plan) {
    return NextResponse.json({ error: 'Plan no disponible' }, { status: 404 })
  }

  const today = todayInBogota()

  // Si ya tiene una mensualidad vigente, registrar otra encima le cobraría dos
  // veces el mismo mes. Primero hay que dejar vencer la que está corriendo.
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

  const starts = startsOn ?? today
  const ends = membershipEndDate(starts)

  const { data: pending } = await admin
    .from('tutoring_memberships')
    .select('id')
    .eq('child_id', childId)
    .eq('status', 'pending_payment')
    .maybeSingle()

  let membershipId = pending?.id

  if (membershipId) {
    // La familia pudo haber abierto el checkout con otro plan: manda lo que se
    // está pagando ahora.
    const { error: updateError } = await admin
      .from('tutoring_memberships')
      .update({
        plan_id: plan.id,
        sessions_included: plan.sessions_included,
        starts_on: starts,
        ends_on: ends,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membershipId)

    if (updateError) {
      return NextResponse.json({ error: 'No pudimos actualizar la mensualidad' }, { status: 500 })
    }
  } else {
    const { data: creada, error: createError } = await admin
      .from('tutoring_memberships')
      .insert({
        child_id: childId,
        plan_id: plan.id,
        status: 'pending_payment',
        sessions_included: plan.sessions_included,
        starts_on: starts,
        ends_on: ends,
      })
      .select('id')
      .single()

    membershipId = creada?.id

    // 23505: la familia abrió el checkout en línea al mismo tiempo. El índice
    // único (migración 037) deja una sola pendiente, así que se usa esa.
    if (!membershipId && createError?.code === '23505') {
      const { data: ganadora } = await admin
        .from('tutoring_memberships')
        .select('id')
        .eq('child_id', childId)
        .eq('status', 'pending_payment')
        .maybeSingle()

      membershipId = ganadora?.id
    }
  }

  if (!membershipId) {
    return NextResponse.json({ error: 'No se pudo crear la mensualidad' }, { status: 500 })
  }

  const reference = `MAN-ST-${membershipId}-${Date.now()}`

  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .insert({
      tutoring_membership_id: membershipId,
      parent_id: child.parent_id,
      reference,
      amount_in_cents: pesosToWompiCents(amount),
      currency: 'COP',
      status: 'APPROVED',
      payment_method: method,
      recorded_by: user.id,
      notes: notes?.trim() || null,
    })
    .select('id, enrollment_id, tutoring_membership_id, referrer_parent_id, consumed_credit_id')
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'No pudimos registrar el pago' }, { status: 500 })
  }

  // Si esto falla, el pago queda registrado pero la mensualidad sin activar.
  // Se devuelve el error para que quien registró lo vea y no quede un niño
  // pagando sin acceso.
  try {
    await applyApprovedPayment(admin, payment)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          'El pago quedó registrado, pero no pudimos activar la mensualidad: ' +
          (error instanceof Error ? error.message : 'error desconocido'),
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    childName: child.full_name,
    planName: plan.name,
    amount,
    startsOn: starts,
    endsOn: ends,
  })
}
