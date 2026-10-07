'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeAccessCode } from '@/lib/espacio'

/**
 * La puerta del espacio del niño.
 *
 * Un solo campo, letras grandes, y el código se va formateando mientras lo
 * escribe. Lo usa un niño de ocho años en el computador de la casa, a veces
 * dictado en voz alta por el instructor en la clase de prueba.
 */
export default function EntrarConCodigo() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      const res = await fetch('/api/mi-espacio/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'No pudimos entrar.')
        return
      }

      router.refresh()
    } catch {
      setError('No hay internet. Revisa la conexión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={entrar} className="w-full max-w-sm">
      <label htmlFor="codigo" className="block text-center text-lg font-bold mb-3">
        Escribe tu código
      </label>
      <input
        id="codigo"
        value={codigo}
        onChange={(e) => setCodigo(normalizeAccessCode(e.target.value).slice(0, 6))}
        // Un niño no quiere que el teclado le corrija su código ni que lo
        // ponga en mayúscula sostenida a medias.
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        placeholder="ABC123"
        className="w-full text-center text-3xl font-bold tracking-[0.3em] py-4 border-2 border-gray-300 rounded-xl focus:border-secondary-500 focus:outline-none uppercase"
        aria-describedby={error ? 'codigo-error' : undefined}
      />

      {error && (
        <p id="codigo-error" role="alert" className="text-red-600 text-sm text-center mt-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={codigo.length !== 6 || enviando}
        className="btn btn-primary w-full mt-5 text-lg disabled:opacity-40"
      >
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>

      <p className="text-sm text-gray-500 text-center mt-6">
        ¿No tienes código? Pídeselo a tu papá o a tu mamá: está en su portal.
      </p>
    </form>
  )
}
