import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
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

  const body = (await request.json()) as {
    instructorId?: string | null
    curriculumLevelId?: string | null
  }

  const updates: Record<string, string | null> = {}
  if ('instructorId' in body) updates.instructor_id = body.instructorId ?? null
  if ('curriculumLevelId' in body) updates.curriculum_level_id = body.curriculumLevelId ?? null

  const admin = createServiceRoleClient()

  const { error: updateError } = await admin.from('courses').update(updates).eq('id', courseId)

  if (updateError) {
    return NextResponse.json({ error: 'No pudimos actualizar el curso' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
