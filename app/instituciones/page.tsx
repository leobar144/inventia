import type { Metadata } from 'next'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'
import InstitutionLeadForm from '@/components/InstitutionLeadForm'

export const metadata: Metadata = {
  title: 'Robótica sin pantallas para jardines infantiles',
  description:
    'Llevamos robótica y pensamiento computacional a jardines infantiles y colegios en Bogotá. Sin pantallas, con robots propios, en grupos de máximo 8 niños.',
}

export default function InstitucionesPage() {
  const exploradores = CURRICULUM_LEVELS.find((l) => l.id === 'exploradores')

  return (
    <>
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="section-container text-center">
          <p className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-3">
            Para jardines infantiles y colegios
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 max-w-3xl mx-auto">
            Robótica sin pantallas para los más pequeños
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Llevamos el programa a su sede, con nuestros propios robots. Sus estudiantes aprenden a
            secuenciar, reconocer patrones y resolver problemas — moviendo robots con las manos, no
            mirando una tableta.
          </p>
          <a href="#contacto-institucional" className="btn btn-primary mt-8">
            Agendar una demostración
          </a>
        </div>
      </section>

      {/* Lo que diferencia el programa */}
      <section className="section bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="text-5xl mb-4">🧸</div>
              <h2 className="text-xl font-bold mb-2">Cero pantallas</h2>
              <p className="text-gray-600">
                Trabajamos con mTiny y Tale-Bot Pro: robots de piso que se programan con tarjetas
                físicas y bloques de madera. El niño programa con las manos, no con un dispositivo.
              </p>
            </div>
            <div className="card p-8">
              <div className="text-5xl mb-4">🎒</div>
              <h2 className="text-xl font-bold mb-2">No necesitan nada</h2>
              <p className="text-gray-600">
                Nosotros llevamos los robots, el material y el instructor. La institución solo pone
                el salón y el horario. Sin inversión en equipos ni en capacitación docente.
              </p>
            </div>
            <div className="card p-8">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-xl font-bold mb-2">Grupos de máximo 8</h2>
              <p className="text-gray-600">
                A estas edades la atención individual no es un lujo, es la condición para que
                funcione. Nunca más de ocho niños por instructor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* El currículo real */}
      {exploradores && (
        <section className="section bg-gray-50">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{exploradores.name}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                {exploradores.purpose}
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200">
                  {exploradores.ageRange}
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200">
                  {exploradores.durationHours} horas
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200">
                  {exploradores.modules.length} módulos
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-gray-200">
                  {exploradores.tools}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {exploradores.modules.map((m) => (
                <div key={m.number} className="card p-5">
                  <p className="text-xs font-bold text-primary-600 mb-1">Módulo {m.number}</p>
                  <h3 className="font-bold mb-2">{m.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{m.competencias}</p>
                  <p className="text-xs text-gray-600">
                    <strong>Proyecto:</strong> {m.proyecto}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              Para instituciones con estudiantes mayores, el programa continúa en niveles de 7-10,
              11-13 y 14-16 años.
            </p>
          </div>
        </section>
      )}

      {/* Cómo funciona */}
      <section className="section bg-white">
        <div className="section-container max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Cómo empezamos</h2>
          <div className="space-y-6">
            {[
              {
                n: '1',
                t: 'Conversamos',
                d: 'Nos cuenta cuántos estudiantes son, de qué edades y qué espacio tienen disponible.',
              },
              {
                n: '2',
                t: 'Demostración sin costo',
                d: 'Vamos a su sede con los robots y hacemos una sesión real con un grupo. Así el equipo docente y las familias ven de qué se trata antes de decidir.',
              },
              {
                n: '3',
                t: 'Propuesta a la medida',
                d: 'Definimos juntos horarios, número de grupos y el esquema que mejor le sirva a la institución.',
              },
              {
                n: '4',
                t: 'Arrancamos',
                d: 'Llegamos con todo listo. Cada familia recibe acceso a un portal donde ve la asistencia y el avance de su hijo.',
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-5">
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{step.t}</h3>
                  <p className="text-gray-600">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section className="section bg-secondary-900 text-white">
        <div className="section-container max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Manejo responsable de los datos</h2>
          <p className="text-secondary-200 mb-6">
            Trabajamos con datos de menores de edad y lo tomamos en serio. Nuestro tratamiento de
            datos se rige por la Ley 1581 de 2012: cada familia autoriza expresamente qué se
            recolecta, las fotografías requieren un permiso adicional y separado, y todo puede
            revocarse en cualquier momento.
          </p>
          <a
            href="/privacidad"
            className="text-primary-300 hover:text-primary-200 font-medium hover:underline"
          >
            Ver nuestra política de tratamiento de datos →
          </a>
        </div>
      </section>

      {/* Formulario */}
      <section id="contacto-institucional" className="section bg-gray-50">
        <div className="section-container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Agendemos una demostración</h2>
            <p className="text-gray-600">
              Déjenos sus datos y nos comunicamos para coordinar una sesión sin costo en su sede.
            </p>
          </div>
          <InstitutionLeadForm />
        </div>
      </section>
    </>
  )
}
