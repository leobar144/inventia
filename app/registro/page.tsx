'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { CONSENT_VERSION } from '@/lib/legal'

interface FormData {
  fullName: string
  email: string
  phone: string
  password: string
  dataConsent: boolean
}

function RegistroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fullName: searchParams.get('nombre') ?? '',
      email: searchParams.get('correo') ?? '',
    },
  })

  const onSubmit = async (formData: FormData) => {
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          // Queda registrado como prueba de la autorización que exige el
          // artículo 9 de la Ley 1581 de 2012.
          data_consent: true,
          data_consent_version: CONSENT_VERSION,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('Ese correo ya tiene una cuenta. Intenta iniciar sesión, o usa "¿Olvidaste tu contraseña?".')
      } else if (msg.includes('rate limit')) {
        setError('Demasiados intentos seguidos. Espera unos minutos y prueba de nuevo.')
      } else {
        setError(`No pudimos crear tu cuenta: ${signUpError.message}`)
      }
      return
    }

    // Si Supabase requiere confirmar el correo, signUp no crea sesión todavía.
    if (!signUpData.session) {
      setError(null)
      router.push('/registro/revisa-tu-correo')
      return
    }

    router.push('/portal')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Crea tu cuenta</h1>
        <p className="text-gray-600 mb-6">
          Regístrate para inscribir a tus hijos y ver su progreso.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              className="input-field"
              {...register('fullName', { required: 'Ingresa tu nombre' })}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              placeholder="300 123 4567"
              className="input-field"
              {...register('phone', { required: 'Ingresa tu número' })}
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="input-field"
              {...register('password', {
                required: 'Ingresa una contraseña',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('dataConsent', {
                  required: 'Necesitamos tu autorización para continuar',
                })}
              />
              <span className="text-sm text-gray-600 leading-snug">
                Soy el padre, madre o representante legal del menor que inscribiré, y autorizo a
                INVENTIA el tratamiento de mis datos personales y los del menor conforme a la{' '}
                <Link
                  href="/privacidad"
                  target="_blank"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Política de Tratamiento de Datos
                </Link>{' '}
                y los{' '}
                <Link
                  href="/terminos"
                  target="_blank"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Términos y Condiciones
                </Link>
                .
              </span>
            </label>
            {errors.dataConsent && (
              <p className="text-red-600 text-sm mt-1">{errors.dataConsent.message}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegistroForm />
    </Suspense>
  )
}
