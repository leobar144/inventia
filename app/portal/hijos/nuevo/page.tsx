'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  fullName: string
  birthDate: string
}

export default function NuevoHijoPage() {
  const router = useRouter()
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setError('Tu sesión expiró. Inicia sesión de nuevo.')
      return
    }

    const { error: insertError } = await supabase.from('children').insert({
      parent_id: user.id,
      full_name: formData.fullName,
      birth_date: formData.birthDate,
    })

    setLoading(false)

    if (insertError) {
      setError('No pudimos guardar el perfil. Intenta de nuevo.')
      return
    }

    router.push('/portal')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-6">Agregar hijo/a</h1>

      <div className="card p-8">
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
              {...register('fullName', { required: 'Ingresa el nombre' })}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              className="input-field"
              {...register('birthDate', { required: 'Ingresa la fecha de nacimiento' })}
            />
            {errors.birthDate && (
              <p className="text-red-600 text-sm mt-1">{errors.birthDate.message}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
