import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Activa o desactiva el perfil público de un niño.
 *
 * Es la "autorización específica y adicional del acudiente" que promete la
 * política de privacidad: se otorga aquí, queda con fecha, y se puede revocar
 * en cualquier momento.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { childId, isPublic } = (await request.json()) as {
    childId: string
    isPublic: boolean
  }

  if (!childId || typeof isPublic !== 'boolean') {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // Solo el acudiente del niño puede cambiar esto. Nadie más, ni siquiera otro
  // padre autenticado.
  const { data: child } = await admin
    .from('children')
    .select('id, public_slug, parent_id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .maybeSingle()

  if (!child) {
    return NextResponse.json({ error: 'Hijo/a no encontrado' }, { status: 404 })
  }

  // El token solo nace cuando se activa por primera vez: un niño que nunca se
  // compartió no tiene enlace que se pueda filtrar.
  const slug = child.public_slug ?? randomBytes(12).toString('base64url')

  const { error: updateError } = await admin
    .from('children')
    .update({
      is_public: isPublic,
      public_slug: slug,
      public_enabled_at: isPublic ? new Date().toISOString() : null,
    })
    .eq('id', childId)

  if (updateError) {
    return NextResponse.json({ error: 'No pudimos guardar el cambio' }, { status: 500 })
  }

  return NextResponse.json({ success: true, isPublic, slug })
}
