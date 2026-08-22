import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { isValidLeadStatus } from '@/lib/leads'

/** Actualiza el estado o el responsable de una solicitud institucional. */
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

  const { leadId, status, assignedTo } = (await request.json()) as {
    leadId: string
    status?: string
    assignedTo?: string | null
  }

  if (!leadId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if (status !== undefined) {
    if (!isValidLeadStatus(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }
    updates.status = status
    // Al pasar de "nuevo" a cualquier otro estado queda registrado cuándo se
    // atendió, para poder ver después cuáles llevan días esperando.
    if (status !== 'nuevo') updates.last_contacted_at = new Date().toISOString()
  }

  if (assignedTo !== undefined) {
    updates.assigned_to = assignedTo || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from('school_leads').update(updates).eq('id', leadId)

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el cambio' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
