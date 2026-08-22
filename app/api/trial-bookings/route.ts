import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAvailableSlots } from '@/lib/supabase/trial-queries'
import { sendTrialBookingNotification, sendParentConfirmationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rateLimit'
import type { TrialBookingInput } from '@/types'

const COURSE_LABELS: Record<string, string> = {
  exploradores: 'Exploradores (4-6 años)',
  scratch: 'Scratch & Bloques',
  python: 'Python & Código Real',
  robotica: 'Robótica',
  ia: 'IA & Futuro',
  no_seguro: 'No está seguro todavía',
}

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export async function GET() {
  try {
    const days = await getAvailableSlots(14)
    return NextResponse.json({ days })
  } catch {
    return NextResponse.json({ error: 'No pudimos cargar los horarios disponibles' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Una familia agenda una vez; tres por hora deja margen para reintentos
  // legítimos y corta cualquier automatización.
  const limit = await checkRateLimit(request, {
    endpoint: 'trial-bookings',
    max: 3,
    windowMinutes: 60,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Ya enviaste varias solicitudes. Espera un momento o escríbenos por WhatsApp.' },
      { status: 429 }
    )
  }

  const body: TrialBookingInput = await request.json()

  if (
    !body.availabilityId ||
    !body.bookingDate ||
    !body.childName ||
    !body.childAge ||
    !body.parentName ||
    !body.whatsapp ||
    !body.parentEmail
  ) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  // Sin autorización de tratamiento de datos no se guarda nada (Ley 1581/2012).
  if (!body.dataConsent) {
    return NextResponse.json(
      { error: 'Necesitamos tu autorización para tratar los datos.' },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  const { data: booking, error } = await supabase
    .from('trial_bookings')
    .insert({
      availability_id: body.availabilityId,
      booking_date: body.bookingDate,
      child_name: body.childName,
      child_age: body.childAge,
      course_interest: body.courseInterest || null,
      parent_name: body.parentName,
      whatsapp: body.whatsapp,
      parent_email: body.parentEmail,
      referred_by_code: body.referredByCode?.trim().toUpperCase() || null,
      data_consent_at: new Date().toISOString(),
      data_consent_version: body.dataConsentVersion || null,
    })
    .select('id')
    .single()

  if (error || !booking) {
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Ese horario ya se acaba de ocupar. Elige otro.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'No pudimos guardar la reserva' }, { status: 500 })
  }

  const { data: availability } = await supabase
    .from('trial_availability')
    .select('time')
    .eq('id', body.availabilityId)
    .single()

  const bookingDateLabel = new Date(`${body.bookingDate}T00:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const timeLabel = availability ? formatTimeLabel(availability.time) : ''
  const courseLabel =
    COURSE_LABELS[body.courseInterest] || body.courseInterest || 'No especificado'
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/clase-de-prueba/confirmacion/${booking.id}`

  try {
    await sendTrialBookingNotification({
      childName: body.childName,
      childAge: body.childAge,
      courseInterest: courseLabel,
      parentName: body.parentName,
      whatsapp: body.whatsapp,
      bookingDateLabel,
      timeLabel,
    })
  } catch (emailError) {
    // La reserva ya quedó guardada — un fallo de correo no debe hacer fallar la reserva.
    console.error('Error enviando notificación de reserva:', emailError)
  }

  try {
    await sendParentConfirmationEmail({
      childName: body.childName,
      childAge: body.childAge,
      courseInterest: courseLabel,
      parentName: body.parentName,
      whatsapp: body.whatsapp,
      parentEmail: body.parentEmail,
      bookingDateLabel,
      timeLabel,
      meetLink: process.env.NEXT_PUBLIC_TRIAL_MEET_LINK,
      confirmationUrl,
    })
  } catch (emailError) {
    console.error('Error enviando confirmación al padre:', emailError)
  }

  return NextResponse.json({ success: true, bookingId: booking.id })
}
