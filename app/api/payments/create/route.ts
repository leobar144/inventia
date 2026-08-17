import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateWompiSignature, pesosToWompiCents } from '@/lib/wompi'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { courseId, childId } = await request.json()
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

  const amountInCents = pesosToWompiCents(course.price)
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
  })
}
