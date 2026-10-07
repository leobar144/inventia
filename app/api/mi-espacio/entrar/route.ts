import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { looksLikeAccessCode, normalizeAccessCode } from '@/lib/espacio'

/**
 * El niño entra a su espacio con el código que le pasó su papá, o que el
 * instructor le dictó en la clase de prueba.
 *
 * El código viaja a una cookie httpOnly y se revalida contra la base en cada
 * carga de la página. No se firma nada ni se guarda el id del niño en la
 * cookie: si ahí fuera el id, bastaría con cambiarlo por otro para entrar al
 * espacio de otro niño. El secreto es el código y solo el código.
 */

/** Seis meses: un niño no debería tener que pedir su código cada semana. */
const DURACION_COOKIE = 60 * 60 * 24 * 180

export const COOKIE_ESPACIO = 'inventia_espacio'

export async function POST(request: Request) {
  // El código es corto, así que la fuerza bruta es el riesgo real. Diez
  // intentos por hora alcanzan de sobra para un niño que se equivoca y cortan
  // cualquier intento de adivinarlo.
  const limite = await checkRateLimit(request, {
    endpoint: 'mi-espacio-entrar',
    max: 10,
    windowMinutes: 60,
  })

  if (!limite.allowed) {
    return NextResponse.json(
      { error: 'Probaste muchas veces. Espera un rato y vuelve a intentar.' },
      { status: 429 }
    )
  }

  let body: { codigo?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'No entendimos el código.' }, { status: 400 })
  }

  const crudo = typeof body.codigo === 'string' ? body.codigo : ''

  // Se descarta lo que ni siquiera tiene forma de código antes de ir a la base:
  // un campo vacío o un texto largo no merecen una consulta.
  if (!looksLikeAccessCode(crudo)) {
    return NextResponse.json(
      { error: 'Ese código no es válido. Son 6 letras y números.' },
      { status: 400 }
    )
  }

  const codigo = normalizeAccessCode(crudo)
  const admin = createServiceRoleClient()

  const { data: child, error } = await admin
    .from('children')
    .select('id, full_name')
    .eq('access_code', codigo)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'No pudimos entrar. Intenta de nuevo.' }, { status: 500 })
  }

  // Mismo mensaje para "no existe" que para un código mal escrito: no hay por
  // qué confirmarle a nadie que un código sí existe.
  if (!child) {
    return NextResponse.json({ error: 'Ese código no lo reconocemos.' }, { status: 404 })
  }

  // Entrar es el primer paso de la misión y se marca solo. Se hace con un RPC
  // sobre el arreglo para no pisar los pasos que ya estuvieran marcados.
  const { data: actual } = await admin
    .from('children')
    .select('space_steps')
    .eq('id', child.id)
    .single()

  const pasos = Array.isArray(actual?.space_steps) ? (actual.space_steps as string[]) : []
  const conEntrada = pasos.includes('entrar') ? pasos : [...pasos, 'entrar']

  await admin
    .from('children')
    .update({ space_steps: conEntrada, space_last_seen_at: new Date().toISOString() })
    .eq('id', child.id)

  const store = await cookies()
  store.set(COOKIE_ESPACIO, codigo, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DURACION_COOKIE,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

/** Salir: se usa cuando el espacio se abrió en un computador compartido. */
export async function DELETE() {
  const store = await cookies()
  store.delete(COOKIE_ESPACIO)
  return NextResponse.json({ ok: true })
}
