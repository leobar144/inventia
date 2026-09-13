import { createServiceRoleClient } from './supabase/server'
import { sendRenewalAlertToParent } from './email'
import { getMembershipProgress, SALA_DE_TAREAS } from './homework'

/**
 * Mantenimiento diario de las mensualidades de la Sala de Tareas.
 *
 * Tres cosas, y las dos primeras importan más que la tercera:
 *
 *   1. VENCER las mensualidades cuyo mes ya pasó. Sin esto una membresía queda
 *      'active' para siempre: el niño que dejó de pagar seguiría apareciendo en
 *      la lista del monitor, el panel contaría un ingreso mensual que ya no
 *      entra, y nadie se daría cuenta hasta cuadrar caja.
 *   2. CERRAR las que ya gastaron todas sus tardes, aunque les queden días de
 *      calendario. Es lo que hace que la tarde suelta funcione.
 *   3. AVISAR a la familia antes de que se acabe, para que renueve sin que el
 *      niño pierda el ritmo.
 *
 * Corre dentro del cron diario que ya existe (el plan gratuito de Vercel no
 * permite un segundo cron job).
 */

/** Hoy en Bogotá (UTC-5 todo el año), en formato YYYY-MM-DD. */
function todayInBogota(): string {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export interface TutoringMaintenanceResult {
  /** Mensualidades cuyo mes ya pasó. */
  expired: number
  /** Mensualidades que se acabaron porque se usaron todas las tardes. */
  usedUp: number
  renewalAlerts: number
}

export async function runTutoringMaintenance(): Promise<TutoringMaintenanceResult> {
  const admin = createServiceRoleClient()
  const today = todayInBogota()

  // --- 1. Vencer lo que ya pasó ---
  const { data: expiredRows } = await admin
    .from('tutoring_memberships')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'active')
    .lt('ends_on', today)
    .select('id')

  // --- 2 y 3. Revisar TODAS las activas ---
  //
  // Sin filtrar por `renewal_alert_sent`: una mensualidad que ya recibió su
  // aviso (a las 2 tardes restantes) tiene que poder cerrarse cuando gaste esas
  // dos. Filtrando aquí, esas membresías no se volvían a mirar nunca y se
  // quedaban abiertas para siempre.
  const { data: active } = await admin
    .from('tutoring_memberships')
    .select('id, child_id, sessions_included, starts_on, ends_on, renewal_alert_sent')
    .eq('status', 'active')

  if (!active || active.length === 0) {
    return { expired: expiredRows?.length ?? 0, usedUp: 0, renewalAlerts: 0 }
  }

  const childIds = [...new Set(active.map((m) => m.child_id))]

  const [{ data: children }, { data: attendance }] = await Promise.all([
    admin.from('children').select('id, full_name, parent_id').in('id', childIds),
    admin
      .from('tutoring_attendance')
      .select('child_id, membership_id')
      .in('child_id', childIds),
  ])

  const childById = new Map((children ?? []).map((c) => [c.id, c]))
  const parentIds = [...new Set((children ?? []).map((c) => c.parent_id))]

  const { data: parents } =
    parentIds.length > 0
      ? await admin.from('profiles').select('id, email, full_name').in('id', parentIds)
      : { data: [] }

  const parentById = new Map((parents ?? []).map((p) => [p.id, p]))

  // Las tardes usadas se cuentan por membresía, no por niño: si no, un niño que
  // lleva tres meses aparecería con la mensualidad nueva agotada de entrada.
  const usedByMembership = new Map<string, number>()
  for (const a of attendance ?? []) {
    if (!a.membership_id) continue
    usedByMembership.set(a.membership_id, (usedByMembership.get(a.membership_id) ?? 0) + 1)
  }

  const portalBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inventiagroup.com'
  const alerted: string[] = []
  const agotadas: string[] = []

  for (const membership of active) {
    const progress = getMembershipProgress(
      membership.sessions_included,
      usedByMembership.get(membership.id) ?? 0,
      membership.ends_on
    )

    // Se acabaron las tardes compradas: la mensualidad terminó aunque falten
    // días de calendario. Sin esto, quien compra UNA tarde suelta seguiría
    // apareciendo en la lista del monitor todo el mes después de usarla, y el
    // panel contaría su plata como ingreso vigente.
    if (progress.remaining <= 0) {
      agotadas.push(membership.id)
      continue
    }

    // El aviso se manda una sola vez; el cierre por tardes agotadas, siempre.
    if (!progress.needsRenewal || membership.renewal_alert_sent) continue

    const child = childById.get(membership.child_id)
    if (!child) continue
    const parent = parentById.get(child.parent_id)
    if (!parent?.email) continue

    await sendRenewalAlertToParent({
      parentEmail: parent.email,
      parentName: parent.full_name ?? 'Familia INVENTIA',
      childName: child.full_name,
      courseTitle: SALA_DE_TAREAS.name,
      classesRemaining: progress.remaining,
      portalUrl: `${portalBase}/portal/hijos/${child.id}/tareas`,
    }).catch(() => {})

    alerted.push(membership.id)
  }

  // Se marca DESPUÉS de enviar: si el envío falla, mañana se vuelve a intentar
  // en vez de quedar marcado como avisado sin que la familia recibiera nada.
  if (alerted.length > 0) {
    await admin
      .from('tutoring_memberships')
      .update({ renewal_alert_sent: true, updated_at: new Date().toISOString() })
      .in('id', alerted)
  }

  if (agotadas.length > 0) {
    await admin
      .from('tutoring_memberships')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .in('id', agotadas)
  }

  return {
    expired: expiredRows?.length ?? 0,
    usedUp: agotadas.length,
    renewalAlerts: alerted.length,
  }
}
