'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  email: string
  password: string
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (formData: FormData) => {
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (signInError) {
      setLoading(false)
      const msg = signInError.message.toLowerCase()
      if (msg.includes('email not confirmed')) {
        setError('Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja (y spam).')
      } else if (msg.includes('invalid login credentials')) {
        setError('Correo o contraseña incorrectos.')
      } else {
        setError(`No pudimos iniciar sesión: ${signInError.message}`)
      }
      return
    }

    const nextParam = searchParams.get('next')
    if (nextParam) {
      router.push(nextParam)
      router.refresh()
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single()

    setLoading(false)

    if (profile?.role === 'admin') router.push('/admin/reservas')
    else if (profile?.role === 'instructor') router.push('/profesor')
    else router.push('/portal')

    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Inicia sesión</h1>
        <p className="text-gray-600 mb-6">Entra al Portal de Padres.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              className="input-field"
              {...register('email', { required: 'Ingresa tu correo' })}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="input-field"
              {...register('password', { required: 'Ingresa tu contraseña' })}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right">
            <Link href="/recuperar-password" className="text-sm text-primary-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-primary-600 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
