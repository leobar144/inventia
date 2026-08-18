import { notFound } from 'next/navigation'
import { getBookingById } from '@/lib/supabase/trial-queries'
import BookingConfirmationCard from '@/components/BookingConfirmationCard'

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

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const booking = await getBookingById(bookingId)

  if (!booking || !booking.trial_availability) notFound()

  const dateLabel = new Date(`${booking.booking_date}T00:00:00`).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const timeLabel = formatTimeLabel(booking.trial_availability.time)
  const targetDateTime = new Date(`${booking.booking_date}T${booking.trial_availability.time}`)

  return (
    <BookingConfirmationCard
      childName={booking.child_name}
      courseLabel={COURSE_LABELS[booking.course_interest ?? ''] ?? booking.course_interest ?? ''}
      dateLabel={dateLabel}
      timeLabel={timeLabel}
      targetDateTime={targetDateTime}
      meetLink={process.env.NEXT_PUBLIC_TRIAL_MEET_LINK}
      parentName={booking.parent_name}
      parentEmail={booking.parent_email ?? undefined}
    />
  )
}
