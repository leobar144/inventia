import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAvailableSlots } from '@/lib/supabase/trial-queries'
import { sendTrialBookingNotification } from '@/lib/email'
import type { TrialBookingInput } from '@/types'

const COURSE_LABELS: Record<string, string> = {
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
  const body: TrialBookingInput = await request.json()

  if (
    !body.availabilityId ||
    !body.bookingDate ||
    !body.childName ||
    !body.childAge ||
    !body.parentName ||
    !body.whatsapp
  ) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  const { error } = await supabase.from('trial_bookings').insert({
    availability_id: body.availabilityId,
    booking_date: body.bookingDate,
    child_name: body.childName,
    child_age: body.childAge,
    course_interest: body.courseInterest || null,
    parent_name: body.parentName,
    whatsapp: body.whatsapp,
  })

  if (error) {
    if (error.code === '23505') {
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

  try {
    await sendTrialBookingNotification({
      childName: body.childName,
      childAge: body.childAge,
      courseInterest: COURSE_LABELS[body.courseInterest] || body.courseInterest || 'No especificado',
      parentName: body.parentName,
      whatsapp: body.whatsapp,
      bookingDateLabel: new Date(`${body.bookingDate}T00:00:00`).toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      timeLabel: availability ? formatTimeLabel(availability.time) : '',
    })
  } catch (emailError) {
    // La reserva ya quedó guardada — un fallo de correo no debe hacer fallar la reserva.
    console.error('Error enviando notificación de reserva:', emailError)
  }

  return NextResponse.json({ success: true })
}
