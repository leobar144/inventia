'use client'

import { useState } from 'react'

/**
 * El código que el acudiente le pasa al niño para que entre a su espacio.
 *
 * Vive en el portal del papá y no en el del niño por una razón: el papá decide
 * cuándo su hijo entra, y puede cambiarlo cuando quiera.
 */
export default function CodigoDelNino({
  childId,
  childName,
  codigoInicial,
}: {
  childId: string
  childName: string
  codigoInicial: string | null
}) {
  const [codigo, setCodigo] = useState(codigoInicial)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  async function pedirCodigo(regenerar: boolean) {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/portal/codigo-hijo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, regenerar }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'No pudimos crear el código')
        return
      }
      setCodigo(data.codigo)
      setConfirmando(false)
    } catch {
      setError('No hay conexión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold mb-1">El espacio de {childName}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {childName} entra a <strong>inventiagroup.com/mi-espacio</strong> con este código y ve su
        propio progreso: su misión, sus clases y sus insignias. No necesita cuenta ni contraseña.
      </p>

      {codigo ? (
        <>
          <p className="text-3xl font-bold tracking-[0.3em] text-center py-4 bg-gray-50 rounded-xl select-all">
            {codigo}
          </p>

          {confirmando ? (
            <div className="mt-4 text-sm">
              <p className="text-gray-700 mb-3">
                Si lo cambias, el código de arriba deja de servir de inmediato y hay que darle el
                nuevo a {childName}.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => pedirCodigo(true)}
                  disabled={cargando}
                  className="btn btn-primary"
                >
                  {cargando ? 'Cambiando…' : 'Sí, cambiarlo'}
                </button>
                <button onClick={() => setConfirmando(false)} className="btn btn-outline">
                  Dejarlo así
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmando(true)}
              className="text-sm text-gray-500 underline mt-3"
            >
              Cambiar el código
            </button>
          )}
        </>
      ) : (
        <button onClick={() => pedirCodigo(false)} disabled={cargando} className="btn btn-primary">
          {cargando ? 'Creando…' : `Crear el código de ${childName}`}
        </button>
      )}

      {error && (
        <p role="alert" className="text-red-600 text-sm mt-3">
          {error}
        </p>
      )}
    </section>
  )
}
