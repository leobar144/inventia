import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAvailableSlots } from '@/lib/supabase/trial-queries'
import type { TrialBookingInput } from '@/types'

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

  return NextResponse.json({ success: true })
}
