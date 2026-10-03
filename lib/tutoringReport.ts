import { createServiceRoleClient } from './supabase/server'
import { sendWeeklyTutoringReport } from './email'
import { detectStuckTopics, getAiUse, type AttendanceForAnalysis } from './homework'

/**
 * Reporte semanal de la Sala de Tareas.
 *
 * Es la promesa que se vende: "cada semana usted recibe un reporte de cómo hizo
 * las tareas y cómo usó la inteligencia artificial". Sin esto, la bitácora de
 * cada tarde se queda guardada y la familia no se entera de nada.
 *
 * Cuándo sale: corre dentro del cron diario (el plan gratuito de Vercel solo
 * permite un cron job) y reporta la última semana escolar TERMINADA, de lunes a
 * viernes. En la práctica sale el sábado; si ese día el envío falla, los días
 * siguientes vuelven a intentarlo con la misma semana, porque la ventana no
 * cambia hasta que pasa el viernes siguiente.
 */

type AdminClient = ReturnType<typeof createServiceRoleClient>

export interface WeeklyReportResult {
  /** Reportes enviados en esta corrida. */
  sent: number
  /** Niños con tardes esa semana a los que ya se les había enviado. */
  alreadySent: number
}

interface AttendanceRow {
  child_id: string
  membership_id: string | null
  subjects: string[] | null
  what_was_done: string | null
  stuck_on: string | null
  ai_use: string
  created_at: string
}

/** Lo mínimo para detectar el tema atascado, más el niño al que pertenece. */
interface HistorialRow {
  child_id: string
  subjects: string[] | null
  stuck_on: string | null
  created_at: string
}

/** Suma días a una fecha YYYY-MM-DD sin pasar por zonas horarias. */
function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/**
 * Lunes y viernes de la última semana escolar terminada, en Bogotá.
 *
 * Si hoy es viernes la semana todavía no termina, así que se reporta la
 * anterior: el viernes el niño puede tener tarde a las 6 p.m.
 */
export function lastSchoolWeek(now: Date = new Date()): { weekStart: string; weekEnd: string } {
  const bogota = new Date(now.getTime() - 5 * 60 * 60 * 1000)
  const day = bogota.getUTCDay() // 0 domingo … 6 sábado

  // Días hacia atrás hasta el último viernes ya terminado.
  const back = day >= 6 ? day - 5 : day + 2
  const friday = new Date(bogota.getTime() - back * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return { weekStart: addDays(friday, -4), weekEnd: friday }
}

function resumirMateria(subjects: string[] | null): string[] {
  return (subjects ?? []).map((s) => s.trim()).filter(Boolean)
}

export async function sendWeeklyTutoringReports(
  admin: AdminClient = createServiceRoleClient(),
  now: Date = new Date()
): Promise<WeeklyReportResult> {
  const { weekStart, weekEnd } = lastSchoolWeek(now)

  // La ventana va del lunes 00:00 al sábado 00:00, hora de Bogotá.
  const fromIso = `${weekStart}T00:00:00-05:00`
  const toIso = `${addDays(weekEnd, 1)}T00:00:00-05:00`

  const { data: week, error } = await admin
    .from('tutoring_attendance')
    .select('child_id, membership_id, subjects, what_was_done, stuck_on, ai_use, created_at')
    .gte('created_at', fromIso)
    .lt('created_at', toIso)

  if (error) throw error
  if (!week || week.length === 0) return { sent: 0, alreadySent: 0 }

  const rows = week as AttendanceRow[]
  const childIds = [...new Set(rows.map((r) => r.child_id))]

  const [{ data: yaEnviados }, { data: children }, { data: historial }] = await Promise.all([
    admin
      .from('tutoring_weekly_reports')
      .select('child_id')
      .eq('week_start', weekStart)
      .in('child_id', childIds),
    admin.from('children').select('id, full_name, parent_id').in('id', childIds),
    // Historial para detectar el tema atascado: la alerta mira las últimas
    // cinco tardes del niño, no solo las de esta semana.
    admin
      .from('tutoring_attendance')
      .select('child_id, subjects, stuck_on, created_at')
      .in('child_id', childIds)
      .lt('created_at', toIso)
      .order('created_at', { ascending: false })
      .limit(childIds.length * 10),
  ])

  const enviados = new Set((yaEnviados ?? []).map((r) => r.child_id))
  const childById = new Map((children ?? []).map((c) => [c.id, c]))

  const parentIds = [...new Set((children ?? []).map((c) => c.parent_id))]
  const { data: parents } =
    parentIds.length > 0
      ? await admin.from('profiles').select('id, email, full_name').in('id', parentIds)
      : { data: [] }
  const parentById = new Map((parents ?? []).map((p) => [p.id, p]))

  const historialPorNino = new Map<string, AttendanceForAnalysis[]>()
  for (const h of (historial ?? []) as HistorialRow[]) {
    const lista = historialPorNino.get(h.child_id) ?? []
    lista.push({ subjects: h.subjects ?? [], stuck_on: h.stuck_on, created_at: h.created_at })
    historialPorNino.set(h.child_id, lista)
  }

  const porNino = new Map<string, AttendanceRow[]>()
  for (const r of rows) {
    const lista = porNino.get(r.child_id) ?? []
    lista.push(r)
    porNino.set(r.child_id, lista)
  }

  const portalBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inventiagroup.com'
  let sent = 0

  for (const [childId, tardes] of porNino) {
    if (enviados.has(childId)) continue

    const child = childById.get(childId)
    if (!child) continue
    const parent = parentById.get(child.parent_id)
    if (!parent?.email) continue

    const materias = [...new Set(tardes.flatMap((t) => resumirMateria(t.subjects)))]

    const usoIA = new Map<string, number>()
    for (const t of tardes) {
      usoIA.set(t.ai_use, (usoIA.get(t.ai_use) ?? 0) + 1)
    }

    const atascos = tardes
      .map((t) => t.stuck_on?.trim())
      .filter((s): s is string => Boolean(s))

    const stuck = detectStuckTopics(historialPorNino.get(childId) ?? [])

    try {
      await sendWeeklyTutoringReport({
        parentEmail: parent.email,
        parentName: parent.full_name ?? 'Familia INVENTIA',
        childName: child.full_name,
        weekStart,
        weekEnd,
        tardes: tardes.length,
        materias,
        usoIA: [...usoIA.entries()].map(([id, veces]) => ({
          label: getAiUse(id)?.label ?? id,
          veces,
        })),
        atascos,
        temaAtascado: stuck[0]
          ? { materia: stuck[0].subjectLabel, veces: stuck[0].times, notas: stuck[0].notes }
          : null,
        portalUrl: `${portalBase}/portal/hijos/${childId}/tareas`,
      })
    } catch {
      // Si el correo falla, no se registra: mañana el cron lo vuelve a intentar
      // con la misma semana.
      continue
    }

    const { error: registroError } = await admin.from('tutoring_weekly_reports').insert({
      child_id: childId,
      membership_id: tardes.find((t) => t.membership_id)?.membership_id ?? null,
      week_start: weekStart,
      attendances: tardes.length,
    })

    // 23505 = otra corrida lo insertó primero. No es un error: ya está enviado.
    if (registroError && registroError.code !== '23505') throw registroError

    sent += 1
  }

  return { sent, alreadySent: enviados.size }
}
