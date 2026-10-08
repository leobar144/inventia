'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AI_USE_OPTIONS, type AiUse } from '@/lib/homework'

/**
 * El protocolo de IA honesta, para tocar.
 *
 * Es el único diferenciador que un competidor global no puede copiar: para
 * registrar cómo usó la IA un niño hay que tener a alguien mirándolo resolver
 * una tarea real. Estaba escrito en el código (AI_USE_OPTIONS, que alimenta la
 * bitácora y el reporte semanal) pero no aparecía en la home.
 *
 * Es además la pieza interactiva que a la página le faltaba: Kodland tiene 28
 * pestañas y nosotros no teníamos ninguna. La diferencia es que esta no se
 * inventó para dar movimiento — muestra el producto real.
 *
 * NO es el reporte de ningún niño: es la explicación de las cuatro casillas.
 * Mientras no haya alumnos con autorización, aquí no va un caso real.
 */

const TONOS = {
  bueno: {
    borde: 'border-primary-500',
    fondo: 'bg-primary-50',
    texto: 'text-primary-700',
    etiqueta: 'Así se aprende',
  },
  neutral: {
    borde: 'border-gray-400',
    fondo: 'bg-gray-50',
    texto: 'text-gray-600',
    etiqueta: 'Sin novedad',
  },
  atencion: {
    borde: 'border-red-500',
    fondo: 'bg-red-50',
    texto: 'text-red-700',
    etiqueta: 'Lo trabajamos',
  },
} as const

export default function ProtocoloIaInteractivo() {
  // Arranca en "Verificó" porque es el uso que enseñamos: lo primero que ve el
  // visitante es la respuesta, no el problema. El tipo va explícito o
  // TypeScript lo fija en ese único literal y los otros tres no compilan.
  const [activo, setActivo] = useState<AiUse>('verificacion')
  const opcion = AI_USE_OPTIONS.find((o) => o.id === activo) ?? AI_USE_OPTIONS[0]
  const tono = TONOS[opcion.tone as keyof typeof TONOS] ?? TONOS.neutral

  return (
    <div className="max-w-3xl mx-auto">
      {/* Las cuatro casillas. Son las mismas que el monitor marca cada tarde. */}
      <div
        role="tablist"
        aria-label="Formas en que un niño puede usar la inteligencia artificial"
        className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5"
      >
        {AI_USE_OPTIONS.map((o) => {
          const seleccionado = o.id === activo
          return (
            <button
              key={o.id}
              role="tab"
              aria-selected={seleccionado}
              onClick={() => setActivo(o.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                seleccionado
                  ? 'border-secondary-500 bg-secondary-50 shadow-sm'
                  : 'border-gray-200 hover:border-secondary-300'
              }`}
            >
              <span className="text-2xl block mb-1" aria-hidden="true">
                {o.icon}
              </span>
              <span className="text-xs font-bold text-gray-700 leading-tight block">{o.short}</span>
            </button>
          )
        })}
      </div>

      {/* El panel que cambia. */}
      <div className={`card p-6 border-l-4 ${tono.borde} ${tono.fondo}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${tono.texto}`}>
          {tono.etiqueta}
        </p>
        <h3 className="text-xl font-heading font-bold mb-2">{opcion.label}</h3>
        <p className="text-gray-700">{opcion.description}</p>
      </div>

      <p className="text-sm text-gray-500 text-center mt-5">
        Cada tarde queda registrada una de estas cuatro, y el sábado recibes el resumen de la
        semana.{' '}
        <Link href="/protocolo" className="text-secondary-600 font-medium hover:underline">
          Ver cómo funciona el protocolo
        </Link>
      </p>
    </div>
  )
}
