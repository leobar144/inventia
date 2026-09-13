import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/** Marcar (o desmarcar) que ya se le escribió a una familia de la lista. */
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id, contacted } = (await request.json()) as { id?: string; contacted?: boolean }
  if (!id) return NextResponse.json({ error: 'Falta el registro' }, { status: 400 })

  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('digital_waitlist')
    .update({
      contacted_at: contacted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'No pudimos actualizar' }, { status: 500 })
  return NextResponse.json({ success: true })
}
