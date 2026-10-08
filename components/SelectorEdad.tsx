'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PROGRAM_TRACKS } from '@/lib/constants'
import { getLevelForAge } from '@/lib/curriculum'

/**
 * "¿Qué le sirve a mi hijo?", respondido en un clic.
 *
 * Es la primera pregunta real de un papá y la web se la respondía con un
 * catálogo de cinco cursos para que la resolviera él. Aquí elige la edad y ve
 * exactamente qué puede tomar.
 *
 * Los rangos se superponen (un niño de 10 cabe en Scratch y en Python), así que
 * se muestran TODOS los que aplican, no el "mejor". Quien decide cuál es el
 * papá, con el instructor, en la clase de prueba.
 *
 * Ya existía un selector de edad parecido dentro de ContactSection, al final de
 * la página: aquel arma un mensaje de WhatsApp, este orienta y lleva a agendar.
 */

const EDADES = Array.from({ length: 13 }, (_, i) => i + 4) // 4 a 16

export default function SelectorEdad() {
  const [edad, setEdad] = useState<number | null>(null)

  const cursos = edad === null ? [] : PROGRAM_TRACKS.filter((t) => edad >= t.ageMin && edad <= t.ageMax)
  const nivel = edad === null ? null : getLevelForAge(edad)

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-center font-bold mb-4">¿Cuántos años tiene?</p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {EDADES.map((a) => (
          <button
            key={a}
            onClick={() => setEdad(a === edad ? null : a)}
            aria-pressed={a === edad}
            className={`w-12 h-12 rounded-full font-bold transition-all ${
              a === edad
                ? 'bg-secondary-600 text-white scale-110 shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-secondary-400'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {edad === null ? (
        <p className="text-center text-gray-500">
          Toque una edad y le mostramos qué puede tomar su hijo.
        </p>
      ) : (
        <div>
          <p className="text-center text-gray-600 mb-5">
            A los <strong className="text-gray-900">{edad} años</strong>
            {nivel ? (
              <>
                {' '}
                le corresponde el nivel <strong className="text-gray-900">{nivel.name}</strong>, y
                puede entrar a:
              </>
            ) : (
              <> puede entrar a:</>
            )}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {cursos.map((curso) => (
              <div key={curso.id} className={`card p-5 border-l-4 ${curso.borderColor}`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0" aria-hidden="true">
                    {curso.icon}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold">{curso.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{curso.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-7">
            <Link href="/clase-de-prueba" className="btn btn-primary">
              Probar 15 minutos, gratis
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              En la clase de prueba definimos cuál le conviene.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
