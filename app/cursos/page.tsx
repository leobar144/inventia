import Link from 'next/link'
import type { Metadata } from 'next'
import { FaCheckCircle } from 'react-icons/fa'
import { PROGRAM_TRACKS } from '@/lib/constants'
import SelectorEdad from '@/components/SelectorEdad'
import { FadeInGrid, FadeInItem } from '@/components/FadeInSection'

export const metadata: Metadata = {
  title: 'Cursos | INVENTIA',
  description:
    'Robótica, programación con Scratch y Python, e inteligencia artificial para niños de 4 a 16 años en Bogotá.',
}

export default function CursosPage() {
  return (
    <>
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Nuestros Cursos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rutas de aprendizaje diseñadas por edades y niveles. Tu hijo/a avanza a su ritmo,
            creando proyectos reales desde la primera clase.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="section-container">
          <FadeInGrid className="grid md:grid-cols-2 gap-8">
            {PROGRAM_TRACKS.map((track) => (
              <FadeInItem
                key={track.id}
                className={`card-hover p-8 border-l-4 ${track.borderColor}`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">{track.icon}</span>
                  <h2 className="text-2xl font-bold">{track.title}</h2>
                </div>
                <p className="text-gray-600 mb-4">{track.description}</p>
                <ul className="space-y-2 mb-6">
                  {track.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center space-x-2">
                      <FaCheckCircle className={track.iconColor} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/clase-de-prueba" className="text-primary-600 font-bold hover:underline">
                  Reservar clase de prueba →
                </Link>
              </FadeInItem>
            ))}
          </FadeInGrid>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por dónde empezar según la edad?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada etapa tiene su propio punto de entrada natural.
            </p>
          </div>
          {/* Antes aquí había cuatro tarjetas fijas (AGE_GROUPS) que
              contradecían los cursos reales: decían Scratch 7-9 cuando va
              hasta los 10, y robótica 10-12 cuando va de 8 a 14. Ahora es el
              mismo selector de la home, que lee las edades de PROGRAM_TRACKS:
              una sola fuente de verdad y, de paso, algo que se puede tocar. */}
          <SelectorEdad />
        </div>
      </section>

      <section className="section bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para que tu hijo/a cree?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Agenda una clase de prueba gratis, sin compromiso, y descubre cuál curso le queda
            mejor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/clase-de-prueba" className="btn bg-white text-primary-700 hover:bg-gray-100">
              Reservar Clase de Prueba Gratis
            </Link>
            <Link href="/#precios" className="btn btn-outline border-white text-white hover:bg-white/10">
              Ver precios
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
