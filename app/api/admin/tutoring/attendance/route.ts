import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { isValidAiUse, SUBJECTS } from '@/lib/homework'

const VALID_SUBJECTS = new Set<string>(SUBJECTS.map((s) => s.id))
const MAX_TEXT = 600

/**
 * El monitor marca quién llegó a la tarde y deja la bitácora de tarea.
 *
 * Una sola ruta para marcar y para escribir: separarlas obligaría al monitor a
 * guardar dos veces por niño, y con doce niños en tres horas eso es justo lo
 * que hace que el registro se deje de llenar.
 */
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

  if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = (await request.json()) as {
    blockId?: string
    childId?: string
    present?: boolean
    subjects?: string[]
    whatWasDone?: string
    stuckOn?: string
    aiUse?: string
    aiNote?: string
    homeworkCompleted?: boolean | null
  }

  const { blockId, childId } = body
  if (!blockId || !childId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: block } = await admin
    .from('tutoring_blocks')
    .select('id, monitor_id')
    .eq('id', blockId)
    .single()

  if (!block) {
    return NextResponse.json({ error: 'Bloque no encontrado' }, { status: 404 })
  }

  // Un monitor solo escribe sobre las tardes que él acompaña.
  if (profile.role === 'instructor' && block.monitor_id !== user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Desmarcar: el niño no llegó (o se marcó por error). Se borra la fila en vez
  // de guardar `attended: false`, porque en la sala no hay lista de inscritos
  // por tarde — la ausencia simplemente no es un dato.
  if (body.present === false) {
    await admin
      .from('tutoring_attendance')
      .delete()
      .eq('block_id', blockId)
      .eq('child_id', childId)

    return NextResponse.json({ success: true, present: false })
  }

  const aiUse = body.aiUse ?? 'no'
  if (!isValidAiUse(aiUse)) {
    return NextResponse.json({ error: 'Uso de IA inválido' }, { status: 400 })
  }

  const subjects = (body.subjects ?? []).filter((s) => VALID_SUBJECTS.has(s))
  const trim = (v?: string) => v?.trim().slice(0, MAX_TEXT) || null

  // La mensualidad vigente queda amarrada a la asistencia: así las tardes usadas
  // se cuentan contra el mes que la familia efectivamente pagó.
  const { data: membership } = await admin
    .from('tutoring_memberships')
    .select('id')
    .eq('child_id', childId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await admin.from('tutoring_attendance').upsert(
    {
      child_id: childId,
      block_id: blockId,
      membership_id: membership?.id ?? null,
      subjects,
      what_was_done: trim(body.whatWasDone),
      stuck_on: trim(body.stuckOn),
      ai_use: aiUse,
      ai_note: trim(body.aiNote),
      homework_completed: body.homeworkCompleted ?? null,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'child_id,block_id' }
  )

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar el registro' }, { status: 500 })
  }

  return NextResponse.json({ success: true, present: true })
}
