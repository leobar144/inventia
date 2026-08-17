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

interface ParentConfirmation extends TrialBookingNotification {
  parentEmail: string
  meetLink?: string
  confirmationUrl: string
}

export async function sendParentConfirmationEmail(data: ParentConfirmation) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey || !data.parentEmail) {
    console.warn('Resend o correo del padre no disponibles — se omite el correo de confirmación')
    return
  }

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from: 'INVENTIA <onboarding@resend.dev>',
    to: data.parentEmail,
    subject: `¡Confirmado! Clase de prueba de ${data.childName} — ${data.bookingDateLabel}`,
    html: `
      <h2>¡Tu clase de prueba está agendada!</h2>
      <p>Hola ${data.parentName},</p>
      <p>Confirmamos la clase de prueba gratis de <strong>${data.childName}</strong>:</p>
      <p style="font-size: 18px; font-weight: bold; color: #2e9655;">
        ${data.bookingDateLabel} · ${data.timeLabel}
      </p>
      ${
        data.meetLink
          ? `<p>Únete a la videollamada aquí: <a href="${data.meetLink}">${data.meetLink}</a></p>`
          : ''
      }
      <p>Guarda este correo — también puedes ver el detalle de tu reserva en cualquier momento aquí:</p>
      <p><a href="${data.confirmationUrl}">${data.confirmationUrl}</a></p>
      <p>Cualquier duda, escríbenos por WhatsApp.</p>
      <p>— El equipo de INVENTIA</p>
    `,
  })
}
