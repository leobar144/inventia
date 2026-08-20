import { createServiceRoleClient } from './server'

export interface PublicChildProfile {
  /** Solo el nombre de pila. Nunca el apellido. */
  firstName: string
  classesCompleted: number
  projects: { id: string; title: string; url: string }[]
}

/**
 * Perfil público de un niño, por token de enlace.
 *
 * Lee con service role a propósito, en vez de abrir una policy de lectura
 * pública sobre `children`: una policy es a nivel de fila, así que expondría
 * también fecha de nacimiento y parent_id a cualquiera con la llave anónima.
 * Aquí se elige campo por campo qué sale al mundo.
 *
 * Devuelve null si el token no existe o si el acudiente no ha dado permiso —
 * la página lo trata como 404, sin revelar cuál de los dos casos fue.
 */
export async function getPublicChildProfile(slug: string): Promise<PublicChildProfile | null> {
  if (!slug) return null

  const supabase = createServiceRoleClient()

  const { data: child } = await supabase
    .from('children')
    .select('id, full_name, classes_completed, is_public')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .maybeSingle()

  if (!child) return null

  const { data: projects } = await supabase
    .from('child_projects')
    .select('id, title, url')
    .eq('child_id', child.id)
    .order('created_at', { ascending: false })

  return {
    firstName: child.full_name.trim().split(/\s+/)[0],
    classesCompleted: child.classes_completed ?? 0,
    projects: projects ?? [],
  }
}
