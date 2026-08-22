import { createHash } from 'crypto'
import { createServiceRoleClient } from './supabase/server'

/**
 * Límite de envíos para los formularios públicos.
 *
 * Sin esto, cualquiera puede automatizar cientos de reservas falsas y provocar
 * dos daños: llenar la agenda con horarios ocupados que no existen, y agotar la
 * cuota mensual de Resend. El segundo es el peligroso — no se ve venir, y el día
 * que se acaba la cuota **dejan de salir los recordatorios de las familias
 * reales**.
 *
 * Se guarda un HASH de la IP, nunca la IP en claro: alcanza para contar envíos
 * del mismo origen sin conservar un dato personal identificable.
 */

/** Toma la IP del visitante de las cabeceras que pone Vercel. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'desconocida'
}

function hashKey(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32)
}

export interface RateLimitResult {
  allowed: boolean
  /** Cuántos envíos quedan en la ventana actual. */
  remaining: number
}

/**
 * Cuenta los envíos recientes de este origen y registra el actual.
 *
 * Ante un fallo de base de datos deja pasar (fail open): que la tabla de
 * control falle no puede impedirle a una familia real agendar su clase.
 */
export async function checkRateLimit(
  request: Request,
  options: { endpoint: string; max: number; windowMinutes: number }
): Promise<RateLimitResult> {
  const { endpoint, max, windowMinutes } = options

  try {
    const admin = createServiceRoleClient()
    const keyHash = hashKey(getClientIp(request))
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

    const { count } = await admin
      .from('rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('endpoint', endpoint)
      .eq('key_hash', keyHash)
      .gte('created_at', windowStart)

    const used = count ?? 0
    if (used >= max) {
      return { allowed: false, remaining: 0 }
    }

    await admin.from('rate_limits').insert({ endpoint, key_hash: keyHash })

    // Limpieza oportunista: se borran los registros que ya salieron de la
    // ventana, para que la tabla no crezca sin control. Barato a esta escala y
    // evita tener que montar una tarea programada solo para esto.
    await admin.from('rate_limits').delete().lt('created_at', windowStart)

    return { allowed: true, remaining: max - used - 1 }
  } catch {
    return { allowed: true, remaining: max }
  }
}
