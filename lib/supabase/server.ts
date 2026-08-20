import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cache } from 'react'

interface CookieToSet {
  name: string
  value: string
  options: CookieOptions
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component with no request context — the
            // middleware refreshes the session on every request, so this is safe to ignore.
          }
        },
      },
    }
  )
}

// Memoiza "¿quién es el usuario logueado?" para que, dentro de una misma
// carga de página, el layout y la página no le pregunten cada uno por su
// lado a Supabase (cada getUser() es un viaje de ida y vuelta real a la
// API de autenticación). react.cache() la reutiliza durante ese único
// render — el middleware sigue haciendo su propia llamada aparte, porque
// corre en un contexto distinto (Edge) antes de que esto exista.
export const getCachedUser = cache(async () => {
  const supabase = await createClient()
  return supabase.auth.getUser()
})

export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
