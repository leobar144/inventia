import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { generateAccessCode } from '@/lib/espacio'

/**
 * Crea (o cambia) el código con el que el niño entra a su espacio.
 *
 * Lo pide el acudiente desde su portal, y es el acudiente quien decide cuándo
 * dárselo al niño. Regenerarlo invalida el anterior al instante: es la salida
 * cuando el código se compartió por donde no debía.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { childId, regenerar } = (await request.json()) as {
    childId?: string
    regenerar?: boolean
  }

  if (!childId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // Solo el acudiente de ese niño. Un padre autenticado no puede pedir el
  // código del hijo de otro.
  const { data: child } = await admin
    .from('children')
    .select('id, access_code, parent_id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .maybeSingle()

  if (!child) {
    return NextResponse.json({ error: 'Hijo/a no encontrado' }, { status: 404 })
  }

  if (child.access_code && !regenerar) {
    return NextResponse.json({ codigo: child.access_code })
  }

  // El código es corto, así que una colisión es posible aunque rara. Se
  // reintenta en vez de devolverle un error al acudiente: el índice único de
  // la columna es el que garantiza que no haya dos niños con el mismo.
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generateAccessCode()
    const { error } = await admin
      .from('children')
      .update({ access_code: codigo })
      .eq('id', child.id)

    if (!error) return NextResponse.json({ codigo })

    // 23505 = ese código ya lo tiene otro niño. Cualquier otro error sí es real.
    if (error.code !== '23505') {
      return NextResponse.json({ error: 'No pudimos crear el código' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'No pudimos crear el código' }, { status: 500 })
}
