'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MISION_BIENVENIDA, SUENOS, type PasoId } from '@/lib/espacio'

/**
 * La misión de bienvenida: los 15 minutos de la clase de prueba vistos desde
 * el lado del niño.
 *
 * Tres pasos y nada más. El primero ya está hecho cuando llega aquí (entró),
 * el segundo lo responde él, y el tercero lo marca cuando le sale el reto que
 * hizo con el instructor.
 */
export default function MisionBienvenida({
  pasos,
  suenoActual,
}: {
  pasos: PasoId[]
  suenoActual: string | null
}) {
  const router = useRouter()
  const [guardando, setGuardando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function marcar(paso: PasoId, sueno?: string) {
    setGuardando(sueno ?? paso)
    setError(null)
    try {
      const res = await fetch('/api/mi-espacio/paso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paso, sueno }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'No se pudo guardar.')
        return
      }
      router.refresh()
    } catch {
      setError('No hay internet. Revisa la conexión.')
    } finally {
      setGuardando(null)
    }
  }

  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold mb-1">Tu primera misión</h2>
      <p className="text-sm text-gray-500 mb-5">
        {pasos.length} de {MISION_BIENVENIDA.length} listos
      </p>

      <ol className="space-y-4">
        {MISION_BIENVENIDA.map((paso) => {
          const hecho = pasos.includes(paso.id)
          return (
            <li key={paso.id} className="flex gap-4">
              <span
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  hecho ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
                aria-hidden="true"
              >
                {hecho ? '✓' : MISION_BIENVENIDA.indexOf(paso) + 1}
              </span>

              <div className="flex-1">
                <p className={`font-bold ${hecho ? 'text-gray-400 line-through' : ''}`}>
                  {paso.titulo}
                </p>
                {!hecho && <p className="text-sm text-gray-600 mt-0.5">{paso.ayuda}</p>}

                {/* Escoger qué quiere crear. Son botones grandes con emoji: se
                    responde de un clic, sin escribir nada. */}
                {!hecho && paso.id === 'sueno' && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {SUENOS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => marcar('sueno', s.id)}
                        disabled={guardando !== null}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition-colors text-left disabled:opacity-50"
                      >
                        <span className="text-2xl" aria-hidden="true">
                          {s.emoji}
                        </span>
                        <span className="text-sm font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {!hecho && paso.id === 'reto' && (
                  <button
                    onClick={() => marcar('reto')}
                    disabled={guardando !== null}
                    className="btn btn-primary mt-3 disabled:opacity-50"
                  >
                    {guardando === 'reto' ? 'Guardando…' : 'Ya me salió'}
                  </button>
                )}

                {hecho && paso.id === 'sueno' && suenoActual && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Quieres crear: {SUENOS.find((s) => s.id === suenoActual)?.label ?? suenoActual}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {error && (
        <p role="alert" className="text-red-600 text-sm mt-4">
          {error}
        </p>
      )}
    </section>
  )
}
