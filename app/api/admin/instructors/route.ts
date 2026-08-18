import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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

  const { fullName, email } = (await request.json()) as { fullName: string; email: string }

  if (!fullName || !email) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/restablecer`,
  })

  if (inviteError || !invited.user) {
    const msg = inviteError?.message?.toLowerCase() ?? ''
    if (msg.includes('already been registered') || msg.includes('already exists')) {
      return NextResponse.json(
        { error: 'Ese correo ya tiene una cuenta. Cámbiale el rol a instructor en la tabla profiles.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'No pudimos invitar al profesor' }, { status: 500 })
  }

  // El trigger on_auth_user_created crea el perfil con role='parent' por
  // defecto — lo subimos a 'instructor' de inmediato.
  const { error: roleError } = await admin
    .from('profiles')
    .update({ role: 'instructor' })
    .eq('id', invited.user.id)

  if (roleError) {
    return NextResponse.json({ error: 'Se invitó, pero no pudimos asignar el rol' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
