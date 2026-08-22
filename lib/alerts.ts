import { Resend } from 'resend'
import { createServiceRoleClient } from './supabase/server'

/**
 * Avisos internos cuando algo se rompe en producción.
 *
 * Sin esto, un webhook de Wompi que falle o un pago que no se registre se
 * descubren cuando un padre escribe molesto — a veces días después, y con la
 * plata ya cobrada. Estos correos llegan en el momento.
 *
 * Se manda a ADMIN_NOTIFICATION_EMAIL, el mismo que ya recibe las reservas.
 */

const FROM = 'INVENTIA Alertas <no-reply@inventiagroup.com>'

/** Una alerta por hora y por contexto: un fallo repetido no debe inundar el correo. */
const ALERT_WINDOW_MINUTES = 60

async function shouldSend(context: string): Promise<boolean> {
  try {
    const admin = createServiceRoleClient()
    const key = `alert:${context}`
    const since = new Date(Date.now() - ALERT_WINDOW_MINUTES * 60 * 1000).toISOString()

    const { count } = await admin
      .from('rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('endpoint', key)
      .gte('created_at', since)

    if ((count ?? 0) > 0) return false

    await admin.from('rate_limits').insert({ endpoint: key, key_hash: 'alerta' })
    return true
  } catch {
    // Si el control de repetición falla, mejor mandar el aviso que perderlo.
    return true
  }
}

/**
 * Avisa de un error en producción.
 *
 * Nunca lanza: una alerta que falla no puede tumbar la operación que la
 * disparó. Un pago se registra aunque el correo de aviso no salga.
 */
export async function alertAdmin(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.ADMIN_NOTIFICATION_EMAIL
    if (!apiKey || !to) return

    if (!(await shouldSend(context))) return

    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: FROM,
      to,
      subject: `⚠️ Error en INVENTIA: ${context}`,
      html: `
        <h2>Algo falló en producción</h2>
        <p><strong>Dónde:</strong> ${context}</p>
        <p><strong>Error:</strong> ${message}</p>
        ${
          extra
            ? `<p><strong>Datos:</strong></p><pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px">${JSON.stringify(extra, null, 2)}</pre>`
            : ''
        }
        ${stack ? `<details><summary>Detalle técnico</summary><pre style="font-size:11px">${stack}</pre></details>` : ''}
        <p style="color:#666;font-size:12px">
          No se enviarán más avisos de este mismo punto durante una hora, para no inundar el correo.
        </p>
      `,
    })
  } catch {
    // Silencio a propósito: el sistema de alertas jamás debe propagar errores.
  }
}
