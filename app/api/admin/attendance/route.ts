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

  const { sessionId, childIds } = (await request.json()) as {
    sessionId: string
    childIds: string[]
  }

  if (!sessionId || !Array.isArray(childIds)) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  if (childIds.length > 0) {
    const rows = childIds.map((childId) => ({
      child_id: childId,
      session_id: sessionId,
      attended: true,
    }))

    const { error: insertError } = await admin
      .from('class_attendance')
      .upsert(rows, { onConflict: 'child_id,session_id', ignoreDuplicates: true })

    if (insertError) {
      return NextResponse.json({ error: 'No pudimos guardar la asistencia' }, { status: 500 })
    }
  }

  // Recalcula classes_completed desde la fuente de verdad para cada niño afectado
  for (const childId of childIds) {
    const { count } = await admin
      .from('class_attendance')
      .select('id', { count: 'exact', head: true })
      .eq('child_id', childId)

    await admin
      .from('children')
      .update({ classes_completed: count ?? 0 })
      .eq('id', childId)
  }

  return NextResponse.json({ success: true })
}
