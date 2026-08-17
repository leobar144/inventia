import { Resend } from 'resend'

interface TrialBookingNotification {
  childName: string
  childAge: number
  courseInterest: string
  parentName: string
  whatsapp: string
  bookingDateLabel: string
  timeLabel: string
}

export async function sendTrialBookingNotification(data: TrialBookingNotification) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ADMIN_NOTIFICATION_EMAIL

  if (!apiKey || !to) {
    console.warn('Resend no configurado — se omite el correo de notificación')
    return
  }

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from: 'INVENTIA <onboarding@resend.dev>',
    to,
    subject: `Nueva reserva de clase de prueba — ${data.childName}`,
    html: `
      <h2>Nueva reserva de clase de prueba</h2>
      <p><strong>Niño/a:</strong> ${data.childName} (${data.childAge} años)</p>
      <p><strong>Curso de interés:</strong> ${data.courseInterest}</p>
      <p><strong>Padre/madre:</strong> ${data.parentName}</p>
      <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
      <p><strong>Horario:</strong> ${data.bookingDateLabel} · ${data.timeLabel}</p>
    `,
  })
}
