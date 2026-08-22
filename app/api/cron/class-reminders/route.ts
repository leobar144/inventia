import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendClassReminderEmail } from '@/lib/email'
import { sendPendingTrialFollowUps } from '@/lib/trialFollowUp'
import { alertAdmin } from '@/lib/alerts'

// Corre una vez al día (ver vercel.json) — el plan gratuito de Vercel no
// permite cron jobs más frecuentes. Por eso el recordatorio es "hoy tienes
// clase" en vez de "en 1 hora tienes clase".
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createServiceRoleClient()

  // Seguimiento de clases de prueba. Comparte esta corrida porque el plan
  // gratuito de Vercel no permite un segundo cron job. Se ejecuta primero y
  // aislado: si algo falla aquí, los recordatorios de clase igual salen.
  let followUps = { day1: 0, day4: 0 }
  try {
    followUps = await sendPendingTrialFollowUps()
  } catch (error) {
    console.error('Error enviando seguimientos de clase de prueba:', error)
    await alertAdmin('cron: seguimientos de clase de prueba', error)
  }

  // Colombia es UTC-5 todo el año (sin horario de verano) — se calcula el
  // rango del "día de hoy en Bogotá" directamente en horas UTC.
  const now = new Date()
  const bogotaOffsetMs = 5 * 60 * 60 * 1000
  const bogotaNow = new Date(now.getTime() - bogotaOffsetMs)
  const dayStartBogota = new Date(
    Date.UTC(bogotaNow.getUTCFullYear(), bogotaNow.getUTCMonth(), bogotaNow.getUTCDate())
  )
  const rangeStart = new Date(dayStartBogota.getTime() + bogotaOffsetMs)
  const rangeEnd = new Date(rangeStart.getTime() + 24 * 60 * 60 * 1000)

  const { data: sessions, error: sessionsError } = await admin
    .from('class_sessions')
    .select('id, title, scheduled_at, course_id, modality, google_meet_link, reminder_sent')
    .gte('scheduled_at', rangeStart.toISOString())
    .lt('scheduled_at', rangeEnd.toISOString())
    .eq('reminder_sent', false)

  if (sessionsError) {
    await alertAdmin('cron: no se pudieron leer las clases del día', sessionsError.message)
    await logCronRun({ ok: false, error: sessionsError.message, followUps })
    return NextResponse.json({ error: sessionsError.message, followUps }, { status: 500 })
  }

  if (!sessions || sessions.length === 0) {
    // Un día sin clases es normal, no un fallo: igual se deja constancia de que
    // la tarea sí corrió.
    await logCronRun({ ok: true, sent: 0, followUps })
    return NextResponse.json({ sent: 0, followUps })
  }

  const courseIds = [...new Set(sessions.map((s) => s.course_id))]
  const { data: courses } = await admin.from('courses').select('id, title').in('id', courseIds)
  const courseTitleById = new Map((courses ?? []).map((c) => [c.id, c.title]))

  const { data: enrollments } = await admin
    .from('enrollments')
    .select('student_id, course_id')
    .in('course_id', courseIds)
    .eq('status', 'active')

  const childIds = [...new Set((enrollments ?? []).map((e) => e.student_id))]
  const { data: children } =
    childIds.length > 0
      ? await admin.from('children').select('id, full_name, parent_id').in('id', childIds)
      : { data: [] }
  const childById = new Map((children ?? []).map((c) => [c.id, c]))

  const parentIds = [...new Set((children ?? []).map((c) => c.parent_id))]
  const { data: parents } =
    parentIds.length > 0
      ? await admin.from('profiles').select('id, email, full_name').in('id', parentIds)
      : { data: [] }
  const parentById = new Map((parents ?? []).map((p) => [p.id, p]))

  // Agrupa: por padre, por hijo, la lista de clases de hoy.
  const grouped = new Map<
    string,
    Map<string, { courseTitle: string; timeLabel: string; modality: 'presencial' | 'virtual'; meetLink: string | null }[]>
  >()

  for (const session of sessions) {
    const relevantEnrollments = (enrollments ?? []).filter((e) => e.course_id === session.course_id)
    for (const enrollment of relevantEnrollments) {
      const child = childById.get(enrollment.student_id)
      if (!child) continue
      const parent = parentById.get(child.parent_id)
      if (!parent?.email) continue

      if (!grouped.has(parent.id)) grouped.set(parent.id, new Map())
      const byChild = grouped.get(parent.id)!
      if (!byChild.has(child.id)) byChild.set(child.id, [])

      byChild.get(child.id)!.push({
        courseTitle: courseTitleById.get(session.course_id) ?? '',
        timeLabel: new Date(session.scheduled_at).toLocaleString('es-CO', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Bogota',
        }),
        modality: (session.modality as 'presencial' | 'virtual') ?? 'virtual',
        meetLink: session.google_meet_link,
      })
    }
  }

  let sent = 0
  for (const [parentId, byChild] of grouped) {
    const parent = parentById.get(parentId)
    if (!parent?.email) continue

    for (const [childId, childSessions] of byChild) {
      const child = childById.get(childId)
      if (!child) continue

      await sendClassReminderEmail({
        parentEmail: parent.email,
        parentName: parent.full_name ?? 'Familia INVENTIA',
        childName: child.full_name,
        sessions: childSessions,
      }).catch(() => {})
      sent++
    }
  }

  await admin
    .from('class_sessions')
    .update({ reminder_sent: true })
    .in(
      'id',
      sessions.map((s) => s.id)
    )

  await logCronRun({ ok: true, sent, followUps })
  return NextResponse.json({ sent, followUps })
}

/**
 * Deja constancia de que la tarea corrió y con qué resultado.
 *
 * Sin esta bitácora, si el cron deja de ejecutarse los recordatorios se apagan
 * en silencio y nadie lo nota en semanas — justo cuando las familias empiezan a
 * faltar a clase sin saber por qué.
 */
async function logCronRun(data: {
  ok: boolean
  sent?: number
  error?: string
  followUps: { day1: number; day4: number }
}) {
  try {
    const admin = createServiceRoleClient()
    await admin.from('cron_runs').insert({
      job: 'class-reminders',
      ok: data.ok,
      reminders_sent: data.sent ?? 0,
      follow_ups_sent: data.followUps.day1 + data.followUps.day4,
      error: data.error ?? null,
    })
  } catch {
    // La bitácora nunca debe tumbar la tarea que documenta.
  }
}
