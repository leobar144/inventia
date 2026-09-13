import type { Metadata } from 'next'
import Link from 'next/link'
import {
  SALA_DE_TAREAS,
  SUBJECTS,
  AI_USE_OPTIONS,
  isDropIn,
  isSellable,
  planFrequencyLabel,
} from '@/lib/homework'
import { getTutoringPlans } from '@/lib/supabase/tutoring-queries'
import { TUTORING_BLOCK_CAPACITY } from '@/lib/economics'
import { SITE_CONFIG } from '@/lib/constants'

// La URL es /asesoria-tareas —lo que la gente escribe en Google— aunque el
// producto se llame Sala de Tareas. Son dos decisiones distintas y no tienen
// por qué coincidir.
export const metadata: Metadata = {
  title: 'Asesoría de tareas en Bogotá — Sala de Tareas INVENTIA',
  description:
    'Acompañamiento en tareas escolares de lunes a viernes en Bogotá. No le hacemos la tarea: le enseñamos a hacerla, y a usar la inteligencia artificial sin hacer trampa. Reporte diario para los papás.',
}

const WHATSAPP_MESSAGE = encodeURIComponent(
  '¡Hola INVENTIA! Quiero información de la Sala de Tareas.'
)

function formatCOP(value: number): string {
  return `$${value.toLocaleString('es-CO')}`
}

const PRECIO_WHATSAPP = encodeURIComponent(
  '¡Hola INVENTIA! Quiero saber el precio de la Sala de Tareas.'
)

export default async function AsesoriaTareasPage() {
  const plans = await getTutoringPlans()

  // Si ningún plan tiene precio todavía, la página no puede prometer precios.
  const hayPrecios = plans.some(isSellable)

  return (
    <>
      {/* Hero — la promesa va primero porque es lo único que nos separa de
          un profesor particular y de ChatGPT. */}
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="section-container text-center">
          <p className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-3">
            Asesoría de tareas · {SALA_DE_TAREAS.ageRange}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-5 max-w-3xl mx-auto">
            No le hacemos la tarea.
            <br />
            <span className="text-primary-600">Le enseñamos a hacerla.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {SALA_DE_TAREAS.scheduleLabel} en nuestro laboratorio. Su hijo llega con lo que le
            dejaron, se sienta a trabajarlo acompañado, y usted recibe el mismo día qué hizo y en
            qué se atascó.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <a
              href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Preguntar por WhatsApp
            </a>
            <a href="#planes" className="btn btn-outline">
              {hayPrecios ? 'Ver precios' : 'Ver opciones'}
            </a>
          </div>
        </div>
      </section>

      {/* El problema. Se nombra directo porque toda mamá de un niño de 11 años
          ya lo vivió, y nombrarlo es lo que hace que siga leyendo. */}
      <section className="section bg-white">
        <div className="section-container max-w-4xl">
          <h2 className="text-3xl font-heading font-bold mb-4 text-center">
            La tarea ya no es el problema. Terminarla sin aprender nada, sí.
          </h2>
          <p className="text-lg text-gray-600 text-center mb-10">
            Hoy cualquier niño con un celular resuelve la tarea en treinta segundos. La entrega
            queda perfecta y el examen del viernes sale mal. Pagar para que alguien más se la haga
            —sea una persona o una aplicación— cuesta plata y no cambia nada.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 border-l-4 border-l-gray-300">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                Lo que suele pasar
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>· Alguien le dicta la respuesta para que alcance a entregar.</li>
                <li>· El niño copia sin entender y usted se entera en el boletín.</li>
                <li>· Un profesor distinto cada vez, que no sabe qué pasó la semana pasada.</li>
                <li>· Ningún reporte: usted pregunta “¿cómo te fue?” y le dicen “bien”.</li>
              </ul>
            </div>
            <div className="card p-6 border-l-4 border-l-primary-500">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600 mb-2">
                Lo que hacemos
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>· Le preguntamos antes de responderle. La respuesta la pone él.</li>
                <li>
                  · Le enseñamos a usar la inteligencia artificial <strong>declarando</strong> cómo
                  la usó — que es justo lo que ya le están pidiendo en el colegio.
                </li>
                <li>
                  · Presencial: máximo {TUTORING_BLOCK_CAPACITY} niños por monitor, siempre en el
                  mismo espacio. Virtual: cupo abierto.
                </li>
                <li>
                  · Usted recibe el registro de cada tarde: materia, qué avanzó y en qué se trabó.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* El diferenciador. Va en su propia sección y con las cuatro etiquetas
          reales del sistema, no como eslogan: es un procedimiento, no una idea. */}
      <section className="section bg-secondary-900 text-white">
        <div className="section-container max-w-4xl">
          <p className="text-sm font-bold text-primary-300 uppercase tracking-wide mb-3 text-center">
            Solo aquí
          </p>
          <h2 className="text-3xl font-heading font-bold mb-4 text-center">
            Somos la academia que enseña inteligencia artificial.
            <br />
            Por eso sabemos cuándo le está haciendo daño.
          </h2>
          <p className="text-secondary-200 text-center mb-10">
            En INVENTIA los niños programan y entrenan modelos de IA. No la prohibimos: enseñamos a
            usarla. En cada tarde queda registrado cómo la usó su hijo — y usted lo ve.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {AI_USE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`rounded-xl p-5 border ${
                  option.tone === 'bueno'
                    ? 'border-primary-400 bg-primary-500/10'
                    : option.tone === 'atencion'
                      ? 'border-accent-400 bg-accent-500/10'
                      : 'border-secondary-600 bg-secondary-800'
                }`}
              >
                <p className="font-bold mb-1">
                  {option.icon} {option.label}
                </p>
                <p className="text-sm text-secondary-200">{option.description}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-secondary-300 text-center mt-8">
            Ningún centro de refuerzo en Bogotá le dice esto, porque no enseña IA y no tiene cómo
            registrarlo.
          </p>
          <div className="text-center mt-6">
            <Link
              href="/protocolo?origen=asesoria-tareas"
              className="btn bg-white text-secondary-900 hover:bg-secondary-50"
            >
              Descargue gratis el protocolo para la casa
            </Link>
          </div>
        </div>
      </section>

      {/* Materias */}
      <section className="section bg-white">
        <div className="section-container max-w-4xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-3">Todas las materias del colegio</h2>
          <p className="text-gray-600 mb-8">
            Su hijo llega con lo que le dejaron ese día. No hay que avisar con anticipación qué
            materia va a trabajar.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {SUBJECTS.filter((s) => s.id !== 'otra').map((subject) => (
              <span
                key={subject.id}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium text-sm"
              >
                {subject.icon} {subject.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* La alerta de tema atascado — el argumento más fuerte y el que ningún
          competidor puede igualar sin software. */}
      <section className="section bg-gray-50">
        <div className="section-container max-w-3xl">
          <div className="card p-8">
            <p className="text-xs font-bold uppercase tracking-wide text-accent-600 mb-2">
              Lo que un profesor particular no puede hacer
            </p>
            <h2 className="text-2xl font-heading font-bold mb-3">
              Le avisamos antes de que salgan las notas
            </h2>
            <p className="text-gray-600 mb-5">
              Cada tarde queda registrado en qué se atascó. Cuando el mismo tema aparece tres veces,
              el sistema nos avisa a nosotros y a usted — semanas antes de que aparezca en un
              boletín.
            </p>
            <div className="rounded-xl bg-accent-50 border border-accent-200 p-4">
              <p className="text-sm font-bold text-accent-800 mb-1">
                ⚠️ Ejemplo de lo que le llegaría
              </p>
              <p className="text-sm text-gray-700">
                “Matemáticas aparece trabada en 3 de las últimas 5 tardes: fracciones equivalentes.
                Sugerimos una sesión de refuerzo antes del examen.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opciones
          Mientras los precios no estén definidos, esta sección vende el QUÉ, no
          el cuánto. Un plan sin precio (`price = null`) sale sin cifra y el
          llamado a la acción va a WhatsApp: es mejor una conversación que un
          número que todavía no se ha decidido. Cuando el precio se escriba en
          `tutoring_plans`, la cifra y el botón de inscripción aparecen solos —
          esta página no hay que volver a tocarla. */}
      <section id="planes" className="section bg-white">
        <div className="section-container">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">
            Desde una sola tarde
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Puede venir un día suelto para probar, o dejarlo fijo por mes. Sin matrícula y sin
            permanencia. {SALA_DE_TAREAS.scheduleLabel}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const suelta = isDropIn(plan)
              const vendible = isSellable(plan)

              return (
                <div
                  key={plan.id}
                  className={`card p-6 flex flex-col ${
                    suelta ? 'border-2 border-secondary-300' : ''
                  }`}
                >
                  {suelta && (
                    <span className="self-start text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 mb-3">
                      Para probar
                    </span>
                  )}
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{planFrequencyLabel(plan)}</p>

                  {vendible && plan.price !== null ? (
                    <>
                      <p className="text-2xl font-heading font-bold text-primary-600 mb-1">
                        {formatCOP(plan.price)}
                      </p>
                      <p className="text-xs text-gray-500 mb-6">
                        {formatCOP(Math.round(plan.price / plan.sessions_included))} por tarde de 3
                        horas
                      </p>
                      <Link href="/checkout/asesoria" className="btn btn-primary w-full mt-auto">
                        Inscribir
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-6">
                        Tres horas de acompañamiento, todas las materias y el reporte de la tarde.
                      </p>
                      <a
                        href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${PRECIO_WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline w-full mt-auto text-sm"
                      >
                        Consultar precio
                      </a>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 max-w-2xl mx-auto rounded-xl bg-primary-50 border border-primary-200 p-5 text-center">
            <p className="font-bold text-primary-800 mb-1">
              ¿Su hijo ya está en un curso de INVENTIA?
            </p>
            <p className="text-sm text-gray-700">
              Tiene <strong>15% de descuento</strong> en la Sala de Tareas. Ya está en el
              laboratorio: solo se queda un rato más.
            </p>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="section bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="section-container text-center max-w-2xl">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Venga una tarde y vea cómo trabaja
          </h2>
          <p className="text-primary-100 mb-8">
            Le mostramos el espacio, le presentamos al monitor y le enseñamos el reporte que va a
            recibir. Sin compromiso.
          </p>
          <a
            href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-white text-primary-700 hover:bg-primary-50"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
