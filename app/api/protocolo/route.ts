import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { alertAdmin } from '@/lib/alerts'
import { CONSENT_VERSION } from '@/lib/legal'
import {
  isValidAgeBand,
  normalizeWhatsapp,
  sanitizeSource,
  PROTOCOLO_PDF_PATH,
} from '@/lib/protocolo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Registro para descargar la guía gratuita y, si la familia quiere, quedar en
 * la lista de espera del curso para padres.
 */
export async function POST(request: Request) {
  const limit = await checkRateLimit(request, {
    endpoint: 'protocolo',
    max: 5,
    windowMinutes: 60,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Ya enviaste varios registros. Espera un momento o escríbenos por WhatsApp.' },
      { status: 429 }
    )
  }

  const body = (await request.json().catch(() => ({}))) as {
    fullName?: string
    whatsapp?: string
    email?: string
    ageBand?: string
    wantsCourse?: boolean
    source?: string
    consent?: boolean
  }

  const fullName = body.fullName?.trim() ?? ''
  if (fullName.length < 2 || fullName.length > 120) {
    return NextResponse.json({ error: 'Escriba su nombre.' }, { status: 400 })
  }

  const whatsapp = normalizeWhatsapp(body.whatsapp ?? '')
  if (!whatsapp) {
    return NextResponse.json(
      { error: 'Revise el WhatsApp: un celular en Colombia tiene 10 dígitos y empieza por 3.' },
      { status: 400 }
    )
  }

  const email = body.email?.trim() || null
  if (email && (email.length > 160 || !EMAIL_RE.test(email))) {
    return NextResponse.json({ error: 'Revise el correo.' }, { status: 400 })
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: 'Necesitamos su autorización para enviarle la guía y tratar sus datos.' },
      { status: 400 }
    )
  }

  const ageBand = body.ageBand && isValidAgeBand(body.ageBand) ? body.ageBand : null
  const source = sanitizeSource(body.source)
  const now = new Date().toISOString()

  // Un 504 pasajero de Supabase no puede costar una familia. Visto en
  // producción el 13/09/2026: la primera consulta a la tabla nueva tardó 5 s
  // y falló; la siguiente respondió en 1 s. Se reintenta una vez antes de
  // rendirse. Es seguro repetirlo: busca por WhatsApp y actualiza o inserta.
  const guardarRegistro = async () => {
    const admin = createServiceRoleClient()

    const { data: existing, error: selectError } = await admin
      .from('digital_waitlist')
      .select('id, wants_course, email, child_age_band')
      .eq('whatsapp', whatsapp)
      .maybeSingle()

    if (selectError) throw selectError

    if (existing) {
      // La familia ya estaba. Se actualiza, sin perder lo que ya había dicho:
      // quien pidió aviso del curso no deja de querer el aviso por volver a
      // descargar la guía con la casilla desmarcada.
      const { error } = await admin
        .from('digital_waitlist')
        .update({
          full_name: fullName,
          email: email ?? existing.email,
          child_age_band: ageBand ?? existing.child_age_band,
          wants_course: existing.wants_course || Boolean(body.wantsCourse),
          consent_version: CONSENT_VERSION,
          consent_at: now,
          updated_at: now,
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      const { error } = await admin.from('digital_waitlist').insert({
        full_name: fullName,
        whatsapp,
        email,
        child_age_band: ageBand,
        wants_course: Boolean(body.wantsCourse),
        source,
        consent_version: CONSENT_VERSION,
        consent_at: now,
      })

      if (error) throw error
    }
  }

  try {
    try {
      await guardarRegistro()
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 600))
      await guardarRegistro()
    }
  } catch (error) {
    // La familia pidió una guía gratuita: se la damos aunque falle el registro.
    // Pero hay que saberlo de inmediato, porque cada fallo es una familia que
    // no queda en la lista. El aviso no lleva datos personales, solo el canal.
    await alertAdmin('protocolo: no se pudo guardar un registro de la lista de espera', error, {
      origen: source,
    })
    return NextResponse.json({ success: true, saved: false, downloadUrl: PROTOCOLO_PDF_PATH })
  }

  return NextResponse.json({ success: true, saved: true, downloadUrl: PROTOCOLO_PDF_PATH })
}
