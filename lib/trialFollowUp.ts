import { createServiceRoleClient } from './supabase/server'
import { sendTrialFollowUpDay1, sendTrialFollowUpDay4 } from './email'
import { SITE_CONFIG } from './constants'

type AdminClient = ReturnType<typeof createServiceRoleClient>

/** Días después de la clase de prueba en que sale cada correo. */
const DAY_1_OFFSET = 1
const DAY_2_OFFSET = 4

function bogotaDateString(daysAgo: number): string {
  // Colombia es UTC-5 todo el año: se resta el desfase y se corta la fecha.
  const bogotaOffsetMs = 5 * 60 * 60 * 1000
  const target = new Date(Date.now() - bogotaOffsetMs - daysAgo * 24 * 60 * 60 * 1000)
  return target.toISOString().slice(0, 10)
}

/**
 * ¿Esta familia ya se inscribió?
 *
 * Se cruza por correo: si existe un perfil con ese correo y tiene al menos un
 * pago aprobado, la secuencia se detiene. Mandarle "vuelve a inscribirte" a
 * alguien que ya pagó es la peor forma de arrancar la relación.
 */
async function alreadyConverted(admin: AdminClient, emails: string[]): Promise<Set<string>> {
  const converted = new Set<string>()
  if (emails.length === 0) return converted

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email')
    .in('email', emails)

  if (!profiles || profiles.length === 0) return converted

  const { data: payments } = await admin
    .from('payments')
    .select('parent_id')
    .in(
      'parent_id',
      profiles.map((p) => p.id)
    )
    .eq('status', 'APPROVED')

  const paidParentIds = new Set((payments ?? []).map((p) => p.parent_id))
  for (const profile of profiles) {
    if (paidParentIds.has(profile.id) && profile.email) converted.add(profile.email.toLowerCase())
  }

  return converted
}

/**
 * Envía los correos de seguimiento de clase de prueba que correspondan hoy.
 *
 * Vive fuera de la ruta del cron porque el cron ya hace otra cosa (recordatorios
 * de clase) y el plan gratuito de Vercel no permite un segundo cron job: los
 * dos trabajos comparten la misma corrida diaria.
 */
export async function sendPendingTrialFollowUps(): Promise<{ day1: number; day4: number }> {
  const admin = createServiceRoleClient()

  const day1Date = bogotaDateString(DAY_1_OFFSET)
  const day4Date = bogotaDateString(DAY_2_OFFSET)

  const [{ data: day1Bookings }, { data: day4Bookings }] = await Promise.all([
    admin
      .from('trial_bookings')
      .select('id, parent_name, parent_email, child_name')
      .eq('booking_date', day1Date)
      .eq('follow_up_1_sent', false),
    admin
      .from('trial_bookings')
      .select('id, parent_name, parent_email, child_name')
      .eq('booking_date', day4Date)
      .eq('follow_up_2_sent', false),
  ])

  const all = [...(day1Bookings ?? []), ...(day4Bookings ?? [])]
  const emails = [...new Set(all.map((b) => b.parent_email).filter(Boolean))]
  const converted = await alreadyConverted(admin, emails)

  const coursesUrl = `${SITE_CONFIG.url}/cursos`
  const whatsappUrl = SITE_CONFIG.links.whatsapp

  let day1 = 0
  for (const booking of day1Bookings ?? []) {
    if (!converted.has(booking.parent_email?.toLowerCase() ?? '')) {
      await sendTrialFollowUpDay1({
        parentEmail: booking.parent_email,
        parentName: booking.parent_name,
        childName: booking.child_name,
        coursesUrl,
        whatsappUrl,
      }).catch(() => {})
      day1++
    }
    // Se marca aunque se haya omitido por conversión: ya no hay nada que
    // mandarle a esa reserva y no queremos reevaluarla cada día.
    await admin.from('trial_bookings').update({ follow_up_1_sent: true }).eq('id', booking.id)
  }

  let day4 = 0
  for (const booking of day4Bookings ?? []) {
    if (!converted.has(booking.parent_email?.toLowerCase() ?? '')) {
      await sendTrialFollowUpDay4({
        parentEmail: booking.parent_email,
        parentName: booking.parent_name,
        childName: booking.child_name,
        coursesUrl,
        whatsappUrl,
      }).catch(() => {})
      day4++
    }
    await admin.from('trial_bookings').update({ follow_up_2_sent: true }).eq('id', booking.id)
  }

  return { day1, day4 }
}
