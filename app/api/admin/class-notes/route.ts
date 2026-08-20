import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Guarda lo que hizo un niño en una clase: una nota y, si el acudiente lo
 * autorizó, una foto.
 *
 * El consentimiento de foto se verifica AQUÍ, en el servidor. La interfaz del
 * profesor también lo esconde, pero eso es comodidad, no seguridad: si el
 * permiso no está dado, la foto se rechaza aunque llegue la petición.
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

  const formData = await request.formData()
  const childId = formData.get('childId') as string | null
  const sessionId = formData.get('sessionId') as string | null
  const note = (formData.get('note') as string | null)?.trim() || null
  const photo = formData.get('photo') as File | null

  if (!childId || !sessionId) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: session } = await admin
    .from('class_sessions')
    .select('id, course_id')
    .eq('id', sessionId)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }

  // Un profesor solo puede escribir sobre las clases que él dicta.
  if (profile.role === 'instructor') {
    const { data: course } = await admin
      .from('courses')
      .select('instructor_id')
      .eq('id', session.course_id)
      .single()

    if (course?.instructor_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
  }

  const { data: child } = await admin
    .from('children')
    .select('id, photo_consent')
    .eq('id', childId)
    .single()

  if (!child) {
    return NextResponse.json({ error: 'Niño/a no encontrado' }, { status: 404 })
  }

  let photoPath: string | null = null

  if (photo && photo.size > 0) {
    // Sin autorización del acudiente no se guarda ninguna imagen del menor.
    if (!child.photo_consent) {
      return NextResponse.json(
        { error: 'La familia no ha autorizado fotos de este niño/a.' },
        { status: 403 }
      )
    }

    if (!ALLOWED_TYPES.includes(photo.type)) {
      return NextResponse.json(
        { error: 'La foto debe ser JPG, PNG o WEBP.' },
        { status: 400 }
      )
    }

    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'La foto no puede pesar más de 5 MB.' }, { status: 400 })
    }

    const ext = photo.type.split('/')[1].replace('jpeg', 'jpg')
    // Nombre aleatorio: la ruta no revela quién es el niño.
    const path = `${childId}/${sessionId}-${randomBytes(6).toString('hex')}.${ext}`

    const { error: uploadError } = await admin.storage
      .from('class-evidence')
      .upload(path, photo, { contentType: photo.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: 'No pudimos subir la foto' }, { status: 500 })
    }

    photoPath = path
  }

  // Se conserva la foto anterior si en esta edición no se mandó una nueva.
  const { data: existing } = await admin
    .from('class_notes')
    .select('id, photo_path')
    .eq('child_id', childId)
    .eq('session_id', sessionId)
    .maybeSingle()

  const { error: upsertError } = await admin.from('class_notes').upsert(
    {
      child_id: childId,
      session_id: sessionId,
      note,
      photo_path: photoPath ?? existing?.photo_path ?? null,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'child_id,session_id' }
  )

  if (upsertError) {
    return NextResponse.json({ error: 'No pudimos guardar la nota' }, { status: 500 })
  }

  // Si se reemplazó una foto, la vieja se borra: no dejamos imágenes de menores
  // huérfanas en el bucket.
  if (photoPath && existing?.photo_path && existing.photo_path !== photoPath) {
    await admin.storage.from('class-evidence').remove([existing.photo_path])
  }

  return NextResponse.json({ success: true, hasPhoto: Boolean(photoPath ?? existing?.photo_path) })
}
