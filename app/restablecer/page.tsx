'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// El cliente se crea una sola vez, en el render inicial.
//
// Esta página vive fuera de /portal a propósito: /portal/layout.tsx verifica
// la sesión en el servidor y redirige a /login antes de que el navegador
// tenga chance de procesar el token del "#" — el chequeo de sesión del
// servidor siempre gana esa carrera. Aquí no hay ningún gate de servidor.
export default function RestablecerPasswordPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // El cliente @supabase/ssr no procesa solo el token que Supabase manda
  // pegado después de "#" (eso es del flujo clásico implicit/hash — este
  // cliente está pensado para el flujo PKCE con cookies). Sin esto, nunca
  // queda una sesión activa y el submit falla con "Session not found".
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token')) {
      setSessionReady(true)
      return
    }

    const params = new URLSearchParams(hash.slice(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error: sessionError }) => {
        if (sessionError) {
          setError('El enlace puede haber expirado — pide uno nuevo.')
        }
        setSessionReady(true)
        window.history.replaceState(null, '', window.location.pathname)
      })
    } else {
      setSessionReady(true)
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setLoading(false)
      setError('No pudimos guardar tu contraseña. El enlace puede haber expirado — pide uno nuevo.')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: profile } = user
      ? await supabase.from('profiles').select('role').eq('id', user.id).single()
      : { data: null }

    setLoading(false)

    if (profile?.role === 'admin') router.push('/admin/reservas')
    else if (profile?.role === 'instructor') router.push('/profesor')
    else router.push('/portal')

    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-16 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-heading font-bold mb-2">Crea tu contraseña</h1>
          <p className="text-gray-600 mb-6">Elige una contraseña para acceder a tu cuenta.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirma la contraseña
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="btn btn-primary w-full"
            >
              {!sessionReady ? 'Verificando enlace...' : loading ? 'Guardando...' : 'Guardar y continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
