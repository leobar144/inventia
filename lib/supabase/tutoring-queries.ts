import { createClient, createServiceRoleClient } from './server'
import {
  detectStuckTopics,
  getMembershipProgress,
  revenuePerAttendance,
  type MembershipProgress,
  type StuckTopic,
  type TutoringPlanRow,
} from '@/lib/homework'
import { computeTutoringBlockEconomics, type TutoringBlockEconomics } from '@/lib/economics'

export interface TutoringBlock {
  id: string
  starts_at: string
  ends_at: string
  monitor_id: string | null
  /** `null` = sin límite (tardes virtuales). */
  capacity: number | null
  modality: string
  meeting_link: string | null
  notes: string | null
}

export interface TutoringAttendanceRow {
  id: string
  child_id: string
  block_id: string
  subjects: string[]
  what_was_done: string | null
  stuck_on: string | null
  ai_use: string
  ai_note: string | null
  homework_completed: boolean | null
  created_at: string
}

/** Planes activos, ordenados de menor a mayor compromiso. */
export async function getTutoringPlans(): Promise<TutoringPlanRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tutoring_plans')
    .select('id, name, sessions_per_week, sessions_included, price')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return data ?? []
}

// ---------------------------------------------------------------------------
// Portal del acudiente

export interface ChildTutoringSummary {
  membership: {
    id: string
    planName: string
    status: string
    startsOn: string
    endsOn: string
    sessionsIncluded: number
  } | null
  progress: MembershipProgress | null
  attendances: (TutoringAttendanceRow & { blockStartsAt: string })[]
  stuckTopics: StuckTopic[]
}

/**
 * Todo lo que el acudiente ve de la Sala de Tareas de un hijo.
 *
 * Verifica la pertenencia contra `parent_id` de forma explícita porque lee con
 * service role, que se salta RLS. Sin esa verificación, cualquier childId
 * ajeno devolvería la bitácora completa de otro niño.
 */
export async function getChildTutoringSummary(
  childId: string,
  parentId: string
): Promise<ChildTutoringSummary> {
  const empty: ChildTutoringSummary = {
    membership: null,
    progress: null,
    attendances: [],
    stuckTopics: [],
  }

  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', parentId)
    .maybeSingle()

  if (!child) return empty

  const [{ data: membership }, { data: rows }] = await Promise.all([
    admin
      .from('tutoring_memberships')
      .select('id, plan_id, status, starts_on, ends_on, sessions_included, tutoring_plans(name)')
      .eq('child_id', childId)
      .in('status', ['active', 'pending_payment'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('tutoring_attendance')
      .select(
        'id, child_id, block_id, subjects, what_was_done, stuck_on, ai_use, ai_note, homework_completed, created_at, tutoring_blocks(starts_at)'
      )
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const attendances = (rows ?? []).map((r) => {
    const { tutoring_blocks: block, ...rest } = r as typeof r & {
      tutoring_blocks: { starts_at: string } | { starts_at: string }[] | null
    }
    const blockRow = Array.isArray(block) ? block[0] : block
    return {
      ...(rest as TutoringAttendanceRow),
      blockStartsAt: blockRow?.starts_at ?? rest.created_at,
    }
  })

  if (!membership) {
    return { ...empty, attendances, stuckTopics: detectStuckTopics(attendances) }
  }

  const planRel = (membership as { tutoring_plans?: { name: string } | { name: string }[] })
    .tutoring_plans
  const plan = Array.isArray(planRel) ? planRel[0] : planRel

  // Las tardes usadas se cuentan SOLO dentro de la vigencia de la membresía
  // actual. Si se contaran todas, un niño que lleva tres meses aparecería con
  // la mensualidad agotada desde el primer día del mes nuevo.
  const usedThisPeriod = attendances.filter((a) => {
    const day = a.blockStartsAt.slice(0, 10)
    return day >= membership.starts_on && day <= membership.ends_on
  }).length

  return {
    membership: {
      id: membership.id,
      planName: plan?.name ?? membership.plan_id,
      status: membership.status,
      startsOn: membership.starts_on,
      endsOn: membership.ends_on,
      sessionsIncluded: membership.sessions_included,
    },
    progress: getMembershipProgress(
      membership.sessions_included,
      usedThisPeriod,
      membership.ends_on
    ),
    attendances,
    stuckTopics: detectStuckTopics(attendances),
  }
}

// ---------------------------------------------------------------------------
// Vista del monitor

export interface BlockChild {
  id: string
  fullName: string
  planName: string
  attendance: TutoringAttendanceRow | null
  membershipId: string
}

export interface BlockWithChildren extends TutoringBlock {
  monitorName: string | null
  children: BlockChild[]
}

/**
 * Los bloques de hoy y de los próximos días, con los niños que tienen
 * mensualidad vigente y la bitácora que ya se haya escrito.
 *
 * La sala no tiene lista de inscritos por bloque: quien tenga membresía activa
 * puede llegar cualquier tarde de las que cubre su plan. Por eso se listan
 * todos los niños con membresía vigente y el monitor marca a los que llegaron.
 */
export async function getBlocksForMonitor(
  monitorId: string | null,
  daysAhead = 7
): Promise<BlockWithChildren[]> {
  const admin = createServiceRoleClient()

  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + daysAhead)

  let query = admin
    .from('tutoring_blocks')
    .select(
      'id, starts_at, ends_at, monitor_id, capacity, modality, meeting_link, notes, profiles(full_name)'
    )
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    .order('starts_at', { ascending: true })

  // null = administrador, ve todos los bloques.
  if (monitorId) query = query.eq('monitor_id', monitorId)

  const { data: blocks } = await query
  if (!blocks || blocks.length === 0) return []

  const blockIds = blocks.map((b) => b.id)

  const [{ data: memberships }, { data: attendance }] = await Promise.all([
    admin
      .from('tutoring_memberships')
      .select('id, child_id, sessions_included, children(full_name), tutoring_plans(name)')
      .eq('status', 'active'),
    admin
      .from('tutoring_attendance')
      .select(
        'id, child_id, block_id, subjects, what_was_done, stuck_on, ai_use, ai_note, homework_completed, created_at'
      )
      .in('block_id', blockIds),
  ])

  const attendanceByKey = new Map<string, TutoringAttendanceRow>()
  for (const a of attendance ?? []) {
    attendanceByKey.set(`${a.block_id}:${a.child_id}`, a as TutoringAttendanceRow)
  }

  const roster = (memberships ?? []).map((m) => {
    const childRel = (m as { children?: { full_name: string } | { full_name: string }[] }).children
    const planRel = (m as { tutoring_plans?: { name: string } | { name: string }[] }).tutoring_plans
    const childRow = Array.isArray(childRel) ? childRel[0] : childRel
    const planRow = Array.isArray(planRel) ? planRel[0] : planRel
    return {
      id: m.child_id,
      membershipId: m.id,
      fullName: childRow?.full_name ?? 'Sin nombre',
      planName: planRow?.name ?? '',
    }
  })

  return blocks.map((b) => {
    const monitorRel = (b as { profiles?: { full_name: string } | { full_name: string }[] }).profiles
    const monitorRow = Array.isArray(monitorRel) ? monitorRel[0] : monitorRel

    return {
      id: b.id,
      starts_at: b.starts_at,
      ends_at: b.ends_at,
      monitor_id: b.monitor_id,
      capacity: b.capacity,
      modality: b.modality,
      meeting_link: b.meeting_link,
      notes: b.notes,
      monitorName: monitorRow?.full_name ?? null,
      children: roster
        .map((c) => ({ ...c, attendance: attendanceByKey.get(`${b.id}:${c.id}`) ?? null }))
        .sort((a, z) => a.fullName.localeCompare(z.fullName, 'es')),
    }
  })
}

// ---------------------------------------------------------------------------
// Panel de administración

export interface TutoringOverview {
  activeMemberships: number
  monthlyRevenue: number
  upcomingBlocks: (TutoringBlock & {
    monitorName: string | null
    attendees: number
    economics: TutoringBlockEconomics
  })[]
  /** Niños con un tema atascado detectado. Es la lista a la que hay que llamar. */
  alerts: { childId: string; childName: string; topics: StuckTopic[] }[]
}

export async function getTutoringOverview(daysAhead = 14): Promise<TutoringOverview> {
  const admin = createServiceRoleClient()

  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + daysAhead)

  const [{ data: memberships }, { data: blocks }, { data: recentAttendance }] = await Promise.all([
    admin
      .from('tutoring_memberships')
      .select('id, child_id, sessions_included, tutoring_plans(name, price, sessions_included)')
      .eq('status', 'active'),
    admin
      .from('tutoring_blocks')
      .select(
        'id, starts_at, ends_at, monitor_id, capacity, modality, meeting_link, notes, profiles(full_name)'
      )
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .order('starts_at', { ascending: true }),
    admin
      .from('tutoring_attendance')
      .select('child_id, subjects, stuck_on, created_at, children(full_name)')
      .order('created_at', { ascending: false })
      .limit(400),
  ])

  const activeRows = memberships ?? []

  const planOf = (m: (typeof activeRows)[number]) => {
    const rel = (
      m as {
        tutoring_plans?:
          | { name: string; price: number; sessions_included: number }
          | { name: string; price: number; sessions_included: number }[]
      }
    ).tutoring_plans
    return Array.isArray(rel) ? rel[0] : rel
  }

  const monthlyRevenue = activeRows.reduce((sum, m) => sum + (planOf(m)?.price ?? 0), 0)

  // Cuánto aporta cada niño activo por tarde. Es la base del margen del bloque.
  const perAttendee = activeRows.map((m) => {
    const plan = planOf(m)
    return plan ? revenuePerAttendance(plan) : 0
  })

  // Alertas de tema atascado, agrupadas por niño.
  const byChild = new Map<
    string,
    { name: string; rows: { subjects: string[]; stuck_on: string | null; created_at: string }[] }
  >()

  for (const a of recentAttendance ?? []) {
    const rel = (a as { children?: { full_name: string } | { full_name: string }[] }).children
    const childRow = Array.isArray(rel) ? rel[0] : rel
    const entry = byChild.get(a.child_id) ?? { name: childRow?.full_name ?? 'Sin nombre', rows: [] }
    entry.rows.push({ subjects: a.subjects, stuck_on: a.stuck_on, created_at: a.created_at })
    byChild.set(a.child_id, entry)
  }

  const alerts = [...byChild.entries()]
    .map(([childId, { name, rows }]) => ({
      childId,
      childName: name,
      topics: detectStuckTopics(rows),
    }))
    .filter((a) => a.topics.length > 0)

  return {
    activeMemberships: activeRows.length,
    monthlyRevenue,
    alerts,
    upcomingBlocks: (blocks ?? []).map((b) => {
      const rel = (b as { profiles?: { full_name: string } | { full_name: string }[] }).profiles
      const monitorRow = Array.isArray(rel) ? rel[0] : rel

      // Proyección: se asume que asisten todos los que pueden. Es el mejor caso,
      // y sirve para saber si la tarde vale la pena abrirla. Sin cupo (virtual)
      // caben todos los que tengan mensualidad activa.
      const expected = b.capacity === null ? perAttendee : perAttendee.slice(0, b.capacity)

      return {
        id: b.id,
        starts_at: b.starts_at,
        ends_at: b.ends_at,
        monitor_id: b.monitor_id,
        capacity: b.capacity,
        modality: b.modality,
        meeting_link: b.meeting_link,
        notes: b.notes,
        monitorName: monitorRow?.full_name ?? null,
        attendees: expected.length,
        economics: computeTutoringBlockEconomics(expected, b.capacity),
      }
    }),
  }
}
