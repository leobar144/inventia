'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/portal/restablecer`,
    })

    setLoading(false)

    if (resetError) {
      setError('No pudimos enviar el correo. Verifica la dirección.')
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Recuperar contraseña</h1>

        {sent ? (
          <p className="text-gray-700">
            Si <strong>{email}</strong> tiene una cuenta, te enviamos un correo con instrucciones
            para restablecer tu contraseña.
          </p>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Ingresa tu correo y te enviamos un enlace para restablecerla.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            Volver a inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
