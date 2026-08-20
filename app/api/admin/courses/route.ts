import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { PRICING_PLANS } from '@/lib/constants'

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

  const {
    title,
    description,
    level,
    price,
    currency,
    schedule,
    maxStudents,
    instructorId,
    curriculumLevelId,
  } = (await request.json()) as {
    title: string
    description: string
    level: string
    price: number
    currency: string
    schedule: string
    maxStudents: number | null
    instructorId: string | null
    curriculumLevelId: string | null
  }

  if (!title || !description || !level || !price || !currency) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: created, error: insertError } = await admin
    .from('courses')
    .insert({
      title,
      description,
      level,
      price,
      currency,
      schedule: schedule || null,
      max_students: maxStudents || null,
      instructor_id: instructorId || null,
      curriculum_level_id: curriculumLevelId || null,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    return NextResponse.json({ error: 'No pudimos crear el curso' }, { status: 500 })
  }

  // Un curso sin planes con precio no se puede comprar. Se siembra con los
  // precios base publicados; el administrador los ajusta después por curso.
  const { error: pricesError } = await admin.from('course_plan_prices').insert(
    PRICING_PLANS.map((plan) => ({
      course_id: created.id,
      plan_id: plan.id,
      price: plan.price,
    }))
  )

  if (pricesError) {
    return NextResponse.json(
      { error: 'Se creó el curso, pero no pudimos asignarle los planes de precio' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
