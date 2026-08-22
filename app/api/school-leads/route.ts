import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendSchoolLeadNotification } from '@/lib/email'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  const limit = await checkRateLimit(request, {
    endpoint: 'school-leads',
    max: 3,
    windowMinutes: 60,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Ya enviaste varias solicitudes. Espera un momento o escríbenos por WhatsApp.' },
      { status: 429 }
    )
  }

  const body = (await request.json()) as {
    institutionName?: string
    contactName?: string
    contactRole?: string
    email?: string
    phone?: string
    studentCount?: number | null
    grades?: string
    message?: string
    consent?: boolean
  }

  if (!body.institutionName || !body.contactName || !body.email || !body.phone) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: 'Necesitamos tu autorización para tratar los datos.' },
      { status: 400 }
    )
  }

  const admin = createServiceRoleClient()

  const { error } = await admin.from('school_leads').insert({
    institution_name: body.institutionName.trim(),
    contact_name: body.contactName.trim(),
    contact_role: body.contactRole?.trim() || null,
    email: body.email.trim(),
    phone: body.phone.trim(),
    student_count: body.studentCount ?? null,
    grades: body.grades?.trim() || null,
    message: body.message?.trim() || null,
  })

  if (error) {
    return NextResponse.json({ error: 'No pudimos guardar la solicitud' }, { status: 500 })
  }

  // El lead ya quedó guardado — un fallo de correo no puede tumbar la respuesta.
  try {
    await sendSchoolLeadNotification({
      institutionName: body.institutionName,
      contactName: body.contactName,
      contactRole: body.contactRole || 'Sin especificar',
      email: body.email,
      phone: body.phone,
      studentCount: body.studentCount ?? null,
      grades: body.grades || 'Sin especificar',
      message: body.message || '',
    })
  } catch (emailError) {
    console.error('Error enviando notificación de lead institucional:', emailError)
  }

  return NextResponse.json({ success: true })
}
