import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  COOKIE_ESPACIO,
  MISION_BIENVENIDA,
  SUENOS,
  parseSteps,
  type PasoId,
} from '@/lib/espacio'

/**
 * El niño marca un paso de su misión, o dice qué quiere crear.
 *
 * Quién es se saca de la cookie, nunca del cuerpo de la petición: si el id del
 * niño viniera del cliente, cualquiera podría marcarle pasos a otro.
 */
export async function POST(request: Request) {
  const store = await cookies()
  const codigo = store.get(COOKIE_ESPACIO)?.value

  if (!codigo) {
    return NextResponse.json({ error: 'Entra con tu código primero.' }, { status: 401 })
  }

  let body: { paso?: unknown; sueno?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'No entendimos.' }, { status: 400 })
  }

  const paso = typeof body.paso === 'string' ? body.paso : ''
  const esPasoValido = MISION_BIENVENIDA.some((p) => p.id === paso)
  if (!esPasoValido) {
    return NextResponse.json({ error: 'Ese paso no existe.' }, { status: 400 })
  }

  // El sueño es opcional, pero si viene tiene que ser una de las opciones
  // cerradas. Nunca se guarda texto libre escrito por un menor.
  const sueno = typeof body.sueno === 'string' ? body.sueno : null
  if (sueno !== null && !SUENOS.some((s) => s.id === sueno)) {
    return NextResponse.json({ error: 'Esa opción no existe.' }, { status: 400 })
  }

  // El paso "qué quieres crear" no se puede marcar sin escoger algo: sin esto,
  // la misión quedaría completa con el dato vacío.
  if (paso === 'sueno' && !sueno) {
    return NextResponse.json({ error: 'Escoge una opción.' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: child, error } = await admin
    .from('children')
    .select('id, space_steps')
    .eq('access_code', codigo)
    .maybeSingle()

  if (error || !child) {
    return NextResponse.json({ error: 'Vuelve a entrar con tu código.' }, { status: 401 })
  }

  const pasos = parseSteps(child.space_steps)
  const nuevos = pasos.includes(paso as PasoId) ? pasos : [...pasos, paso as PasoId]

  const cambios: Record<string, unknown> = {
    space_steps: nuevos,
    space_last_seen_at: new Date().toISOString(),
  }
  if (sueno) cambios.space_dream = sueno

  const { error: updateError } = await admin.from('children').update(cambios).eq('id', child.id)

  if (updateError) {
    return NextResponse.json({ error: 'No pudimos guardarlo. Intenta otra vez.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, pasos: nuevos })
}
