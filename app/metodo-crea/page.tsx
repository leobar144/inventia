import Link from 'next/link'
import type { Metadata } from 'next'
import { FaCheckCircle } from 'react-icons/fa'
import { CURRICULUM_LEVELS, LEARNING_AXES, METHODOLOGY_DESCRIPTION } from '@/lib/curriculum'
import { FadeInGrid, FadeInItem } from '@/components/FadeInSection'

export const metadata: Metadata = {
  title: 'Método CREA | INVENTIA',
  description:
    'Conoce la malla curricular de INVENTIA: 4 niveles por edad, 8 módulos cada uno, progresando de la exploración a la creación de soluciones tecnológicas reales.',
}

export default function MetodoCreaPage() {
  return (
    <>
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">El Método CREA</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {METHODOLOGY_DESCRIPTION}
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">7 ejes de aprendizaje</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada nivel trabaja estos mismos ejes — lo que cambia es su complejidad.
            </p>
          </div>
          <FadeInGrid className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {LEARNING_AXES.map((axis, i) => (
              <FadeInItem key={axis} className="card p-5 text-center">
                <p className="text-2xl font-bold text-primary-600 mb-1">{i + 1}</p>
                <p className="text-sm font-medium">{axis}</p>
              </FadeInItem>
            ))}
          </FadeInGrid>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">4 niveles, una progresión clara</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorar → Construir → Programar → Diseñar → Integrar → Innovar
            </p>
          </div>

          <div className="space-y-8">
            {CURRICULUM_LEVELS.map((level) => (
              <div key={level.id} className="card p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{level.name}</h3>
                    <p className="text-gray-500">{level.ageRange}</p>
                  </div>
                  <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                    {level.durationHours} horas · 8 módulos
                  </span>
                </div>

                <p className="text-lg font-medium text-secondary-700 italic mb-3">
                  {level.orientingQuestion}
                </p>
                <p className="text-gray-600 mb-4">{level.purpose}</p>
                <p className="text-sm text-gray-500 mb-6">
                  <strong>Herramientas:</strong> {level.tools}
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {level.modules.map((m) => (
                    <div key={m.number} className="flex items-start gap-2 text-sm">
                      <FaCheckCircle className="text-primary-500 mt-0.5 shrink-0" />
                      <span>
                        <strong>
                          Módulo {m.number}: {m.title}
                        </strong>{' '}
                        — {m.proyecto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ve el Método CREA en acción</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Agenda una clase de prueba gratis y descubre en qué nivel encaja tu hijo/a.
          </p>
          <Link href="/clase-de-prueba" className="btn bg-white text-primary-700 hover:bg-gray-100">
            Reservar Clase de Prueba Gratis
          </Link>
        </div>
      </section>
    </>
  )
}
