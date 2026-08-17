import { createServiceRoleClient } from './server'
import type { TrialAvailability, AvailableSlotDay } from '@/types'

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Calcula los horarios disponibles de los próximos `daysAhead` días cruzando
 * la plantilla semanal (trial_availability) con las reservas ya existentes
 * (trial_bookings). Corre siempre en el servidor porque trial_bookings no
 * tiene policy de lectura pública.
 */
export async function getAvailableSlots(daysAhead: number = 14): Promise<AvailableSlotDay[]> {
  const supabase = createServiceRoleClient()

  const { data: availability, error: availabilityError } = await supabase
    .from('trial_availability')
    .select('*')
    .eq('is_active', true)

  if (availabilityError) throw availabilityError
  if (!availability || availability.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const rangeEnd = new Date(today)
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead)

  const { data: bookings, error: bookingsError } = await supabase
    .from('trial_bookings')
    .select('availability_id, booking_date')
    .gte('booking_date', toDateString(today))
    .lte('booking_date', toDateString(rangeEnd))

  if (bookingsError) throw bookingsError

  const bookedSet = new Set(
    (bookings ?? []).map((b) => `${b.availability_id}_${b.booking_date}`)
  )

  const days: AvailableSlotDay[] = []

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = toDateString(date)
    const dayOfWeek = date.getDay()

    const slotsForDay = (availability as TrialAvailability[])
      .filter((a) => a.day_of_week === dayOfWeek)
      .filter((a) => !bookedSet.has(`${a.id}_${dateStr}`))
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((a) => ({ availabilityId: a.id, time: a.time }))

    if (slotsForDay.length > 0) {
      days.push({ date: dateStr, slots: slotsForDay })
    }
  }

  return days
}
