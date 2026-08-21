import { Resend } from 'resend'

const FROM = 'INVENTIA <no-reply@inventiagroup.com>'

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
    from: FROM,
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
    from: FROM,
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

interface BadgeLevelUp {
  parentEmail: string
  parentName: string
  childName: string
  badgeIcon: string
  badgeName: string
  unlocks: string
  portalUrl: string
}

export async function sendBadgeLevelUpEmail(data: BadgeLevelUp) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !data.parentEmail) return

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from: FROM,
    to: data.parentEmail,
    subject: `🎉 ${data.childName} alcanzó ${data.badgeName}`,
    html: `
      <h2>¡Felicitaciones, ${data.parentName}! ${data.badgeIcon}</h2>
      <p><strong>${data.childName}</strong> acaba de alcanzar el nivel <strong>${data.badgeName}</strong> en INVENTIA.</p>
      <p>Esto desbloquea: ${data.unlocks}</p>
      <p><a href="${data.portalUrl}">Ver el progreso de ${data.childName} →</a></p>
      <p>— El equipo de INVENTIA</p>
    `,
  })
}

interface RenewalAlertParent {
  parentEmail: string
  parentName: string
  childName: string
  courseTitle: string
  classesRemaining: number
  portalUrl: string
}

export async function sendRenewalAlertToParent(data: RenewalAlertParent) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !data.parentEmail) return

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from: FROM,
    to: data.parentEmail,
    subject: `A ${data.childName} le quedan ${data.classesRemaining} clases de ${data.courseTitle}`,
    html: `
      <h2>¡${data.childName} va muy bien! 🚀</h2>
      <p>Hola ${data.parentName}, le quedan <strong>${data.classesRemaining} clases</strong> para terminar
      <strong>${data.courseTitle}</strong>. Para que no se quede sin cupo cuando termine, puedes escribirnos
      por WhatsApp para renovar con tiempo.</p>
      <p><a href="${data.portalUrl}">Ver el progreso de ${data.childName} →</a></p>
      <p>— El equipo de INVENTIA</p>
    `,
  })
}

interface TrialFollowUp {
  parentEmail: string
  parentName: string
  childName: string
  coursesUrl: string
  whatsappUrl: string
}

/** Día +1 tras la clase de prueba: agradecer y abrir la conversación. */
export async function sendTrialFollowUpDay1(data: TrialFollowUp) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !data.parentEmail) return

  const resend = new Resend(apiKey)
  const firstName = data.childName.trim().split(/\s+/)[0]

  await resend.emails.send({
    from: FROM,
    to: data.parentEmail,
    subject: `¿Cómo le fue a ${firstName} en su clase?`,
    html: `
      <h2>¿Qué te contó ${firstName}? 🚀</h2>
      <p>Hola ${data.parentName}, gracias por traer a ${firstName} a su clase de prueba en INVENTIA.</p>
      <p>Nos encantaría saber cómo la vivió. Si tienes cualquier duda sobre los cursos, los horarios
      o cómo funciona, respóndenos este correo o escríbenos por WhatsApp — te contestamos de una.</p>
      <p>Si ${firstName} quedó con ganas de más, estos son los planes disponibles. Los grupos son de
      máximo 8 niños, así que los cupos son limitados:</p>
      <p><a href="${data.coursesUrl}">Ver planes y cupos disponibles →</a></p>
      <p><a href="${data.whatsappUrl}">O escríbenos por WhatsApp</a></p>
      <p>— El equipo de INVENTIA</p>
    `,
  })
}

/** Día +4: última llamada, con urgencia real (los cupos sí son 8). */
export async function sendTrialFollowUpDay4(data: TrialFollowUp) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !data.parentEmail) return

  const resend = new Resend(apiKey)
  const firstName = data.childName.trim().split(/\s+/)[0]

  await resend.emails.send({
    from: FROM,
    to: data.parentEmail,
    subject: `Todavía guardamos un cupo para ${firstName}`,
    html: `
      <h2>El cupo de ${firstName} sigue disponible</h2>
      <p>Hola ${data.parentName}, sabemos que estas decisiones toman tiempo.</p>
      <p>Solo queríamos contarte que todavía hay espacio en el grupo de ${firstName}. Como trabajamos
      con máximo 8 niños por clase para que cada uno reciba atención real, los cupos se van rápido.</p>
      <p>Si tienes alguna duda sobre el método, los horarios o el costo, escríbenos y lo resolvemos
      en dos minutos. Y si por ahora no es el momento, no hay problema — aquí estaremos.</p>
      <p><a href="${data.coursesUrl}">Ver planes →</a></p>
      <p><a href="${data.whatsappUrl}">Hablar por WhatsApp</a></p>
      <p>— El equipo de INVENTIA</p>
    `,
  })
}

interface RenewalAlertAdmin {
  childName: string
  courseTitle: string
  classesRemaining: number
  parentName: string
  parentEmail: string
}

export async function sendRenewalAlertToAdmin(data: RenewalAlertAdmin) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!apiKey || !to) return

  const resend = new Resend(apiKey)

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Seguimiento comercial: ${data.childName} — quedan ${data.classesRemaining} clases`,
    html: `
      <h2>Oportunidad de renovación</h2>
      <p><strong>${data.childName}</strong> (padre/madre: ${data.parentName}, ${data.parentEmail})
      le quedan <strong>${data.classesRemaining} clases</strong> de <strong>${data.courseTitle}</strong>.</p>
      <p>Vale la pena contactar para ofrecer la renovación antes de que termine el plan.</p>
    `,
  })
}

interface ClassReminderSession {
  courseTitle: string
  timeLabel: string
  modality: 'presencial' | 'virtual'
  meetLink: string | null
}

interface ClassReminder {
  parentEmail: string
  parentName: string
  childName: string
  sessions: ClassReminderSession[]
}

export async function sendClassReminderEmail(data: ClassReminder) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !data.parentEmail || data.sessions.length === 0) return

  const resend = new Resend(apiKey)

  const sessionsHtml = data.sessions
    .map(
      (s) => `
      <li style="margin-bottom: 8px;">
        <strong>${s.courseTitle}</strong> — ${s.timeLabel} —
        ${s.modality === 'presencial' ? '📍 Presencial' : s.meetLink ? `<a href="${s.meetLink}">💻 Unirse por Meet</a>` : '💻 Virtual'}
      </li>`
    )
    .join('')

  await resend.emails.send({
    from: FROM,
    to: data.parentEmail,
    subject: `Hoy ${data.childName} tiene clase en INVENTIA`,
    html: `
      <h2>¡Hoy es día de clase! 📅</h2>
      <p>Hola ${data.parentName}, este es el recordatorio de las clases de <strong>${data.childName}</strong> hoy:</p>
      <ul>${sessionsHtml}</ul>
      <p>— El equipo de INVENTIA</p>
    `,
  })
}
