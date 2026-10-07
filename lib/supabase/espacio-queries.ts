import { createServiceRoleClient } from './server'
import { parseSteps, type PasoId } from '../espacio'

/**
 * Los datos del espacio del niño.
 *
 * Se consultan con service role porque quien pide no tiene sesión de Supabase:
 * un niño no tiene cuenta. La autorización es el código, que ya se validó al
 * entrar y se revalida aquí en cada carga.
 *
 * Esta consulta decide qué ve un niño, así que trae lo mínimo: nada de
 * apellidos de terceros, correos, teléfonos, pagos ni datos del acudiente.
 */

export interface EspacioDelNino {
  id: string
  fullName: string
  classesCompleted: number
  pasos: PasoId[]
  sueno: string | null
  proximaClase: { titulo: string; cuando: string; enlace: string | null } | null
  proyectos: number
}

export async function getEspacioByCode(codigo: string): Promise<EspacioDelNino | null> {
  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id, full_name, classes_completed, space_steps, space_dream')
    .eq('access_code', codigo)
    .maybeSingle()

  if (!child) return null

  const [{ data: enrollments }, { count: proyectos }] = await Promise.all([
    admin.from('enrollments').select('course_id').eq('student_id', child.id).eq('status', 'active'),
    admin
      .from('child_projects')
      .select('id', { count: 'exact', head: true })
      .eq('child_id', child.id),
  ])

  const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id))]
  let proximaClase: EspacioDelNino['proximaClase'] = null

  if (courseIds.length > 0) {
    const { data: sesiones } = await admin
      .from('class_sessions')
      .select('title, scheduled_at, google_meet_link, course_id')
      .in('course_id', courseIds)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)

    const s = sesiones?.[0]
    if (s) {
      // En hora de Bogotá y en palabras, no en formato de máquina: lo lee un
      // niño, no un sistema.
      const cuando = new Date(s.scheduled_at).toLocaleString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Bogota',
      })
      proximaClase = {
        titulo: s.title ?? 'Tu clase',
        cuando,
        enlace: s.google_meet_link,
      }
    }
  }

  return {
    id: child.id,
    fullName: child.full_name,
    classesCompleted: child.classes_completed ?? 0,
    pasos: parseSteps(child.space_steps),
    sueno: child.space_dream ?? null,
    proximaClase,
    proyectos: proyectos ?? 0,
  }
}
