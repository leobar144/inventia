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

  const { courseId, title, scheduledAt, modality, moduleNumber, googleMeetLink } =
    (await request.json()) as {
      courseId: string
      title: string
      scheduledAt: string
      modality: 'presencial' | 'virtual'
      moduleNumber: number | null
      googleMeetLink: string | null
    }

  if (!courseId || !title || !scheduledAt || !modality) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { error: insertError } = await admin.from('class_sessions').insert({
    course_id: courseId,
    title,
    scheduled_at: scheduledAt,
    modality,
    module_number: moduleNumber || null,
    google_meet_link: modality === 'virtual' ? googleMeetLink || null : null,
  })

  if (insertError) {
    return NextResponse.json({ error: 'No pudimos crear la sesión' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
