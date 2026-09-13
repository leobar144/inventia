import type { Metadata } from 'next'
import Link from 'next/link'
import ProtocoloForm from '@/components/ProtocoloForm'
import { AI_USE_OPTIONS } from '@/lib/homework'

// Esta es la dirección que se dice en los videos y va en la bio de Instagram:
// corta, fácil de dictar. Se enlaza con ?origen= para saber qué canal trae
// familias (inventiagroup.com/protocolo?origen=instagram).
export const metadata: Metadata = {
  title: 'Protocolo de IA honesta para las tareas',
  description:
    'Guía gratuita para familias: cómo acompañar a su hijo cuando la inteligencia artificial puede hacerle la tarea. El mismo protocolo de la Sala de Tareas de INVENTIA.',
}

export default function ProtocoloPage() {
  return (
    <>
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-3">
                Guía gratuita para familias
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-5">
                Su hijo ya usa IA para las tareas.
                <span className="block text-primary-600">Así se acompaña.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Prohibirla no funciona y dejarla sin reglas tampoco. Este es el protocolo que usamos
                en la Sala de Tareas de INVENTIA, escrito para aplicarlo en casa desde hoy.
              </p>

              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                Qué trae
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>
                    Las <strong>cuatro formas</strong> en que un niño usa la IA para una tarea, y
                    cuáles le sirven.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>
                    La <strong>prueba del «explícamelo»</strong>: cómo saber en dos minutos si
                    aprendió o solo copió.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>
                    Qué decir —y qué no— cuando descubre que <strong>la IA le hizo la tarea</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  <span>
                    Qué esperar <strong>según la edad</strong>, de los 4 a los 16 años.
                  </span>
                </li>
              </ul>
            </div>

            <ProtocoloForm />
          </div>
        </div>
      </section>

      {/* Adelanto del contenido: las cuatro formas salen de la misma fuente que
          usa el monitor de la Sala de Tareas (lib/homework.ts), así que la guía,
          la web y el registro diario siempre dicen lo mismo. */}
      <section className="section bg-white">
        <div className="section-container max-w-4xl">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">
            No es si usa la IA. Es cómo.
          </h2>
          <p className="text-gray-600 text-center mb-10">
            Estas son las cuatro formas que registramos cada tarde en la Sala de Tareas.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {AI_USE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`rounded-xl p-5 border ${
                  option.tone === 'bueno'
                    ? 'border-primary-200 bg-primary-50'
                    : option.tone === 'atencion'
                      ? 'border-accent-200 bg-accent-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="font-bold text-gray-800 mb-1">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-8">
            ¿Prefiere que lo acompañemos nosotros?{' '}
            <Link href="/asesoria-tareas" className="text-primary-600 font-medium hover:underline">
              Conozca la Sala de Tareas
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
