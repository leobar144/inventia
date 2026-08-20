import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Autorización del acudiente para que INVENTIA tome y guarde fotos del menor.
 *
 * Es un permiso APARTE del consentimiento general de datos y del perfil público:
 * una familia puede querer que su hijo aparezca en clase sin querer fotos, o
 * aceptar fotos en su portal privado sin querer que circulen. Cada permiso se
 * da y se revoca por separado.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { childId, photoConsent } = (await request.json()) as {
    childId: string
    photoConsent: boolean
  }

  if (!childId || typeof photoConsent !== 'boolean') {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: child } = await admin
    .from('children')
    .select('id')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .maybeSingle()

  if (!child) {
    return NextResponse.json({ error: 'Hijo/a no encontrado' }, { status: 404 })
  }

  const { error: updateError } = await admin
    .from('children')
    .update({
      photo_consent: photoConsent,
      photo_consent_at: photoConsent ? new Date().toISOString() : null,
    })
    .eq('id', childId)

  if (updateError) {
    return NextResponse.json({ error: 'No pudimos guardar el cambio' }, { status: 500 })
  }

  return NextResponse.json({ success: true, photoConsent })
}
