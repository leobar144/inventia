import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CREADORES_CON_IA,
  CREADORES_DAYS,
  CREADORES_FAQ,
  CREADORES_INCLUDES,
  CREADORES_TOTAL_HOURS,
  isCreadoresOpen,
} from '@/lib/creadores'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Curso de inteligencia artificial para niños en diciembre — Creadores con IA | INVENTIA',
  description:
    'Taller virtual en vivo del 1 al 4 de diciembre para niños de 8 a 14 años. En cuatro mañanas construye su propio proyecto con inteligencia artificial, lo presenta y queda publicado. Grupos de máximo 8.',
}

function formatCOP(value: number): string {
  return `$${value.toLocaleString('es-CO')}`
}

const WHATSAPP = (text: string) =>
  `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(text)}`

export default function CreadoresConIaPage() {
  const abierto = isCreadoresOpen()

  // El precio por hora es el argumento más fuerte frente a una clase
  // particular, así que se calcula en vez de escribirse a mano: si cambia el
  // precio o el número de sesiones, la cifra sigue siendo cierta.
  const precioPorHora = Math.round(CREADORES_CON_IA.priceCOP / CREADORES_TOTAL_HOURS)

  return (
    <>
      {/* Hero. El gancho es la diferencia entre consumir tecnología y crearla:
          es la frase que le mueve algo a un papá que ya vio a su hijo seis
          horas en el celular en vacaciones. */}
      <section className="section bg-gradient-to-br from-secondary-50 via-white to-secondary-100">
        <div className="section-container text-center">
          <p className="text-sm font-bold text-secondary-600 uppercase tracking-wide mb-3">
            Receso de diciembre · {CREADORES_CON_IA.ageRange} · {CREADORES_CON_IA.modality}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-5 max-w-3xl mx-auto">
            Estas vacaciones su hijo no va a consumir tecnología.
            <br />
            <span className="text-secondary-600">La va a construir.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cuatro mañanas en vivo. Entra sin saber nada de inteligencia artificial y sale con un
            proyecto propio, terminado, presentado y publicado con su nombre.
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center mt-8 text-sm text-gray-600">
            <span>
              📅 <strong>{CREADORES_CON_IA.datesLabel}</strong>
            </span>
            <span>
              🕘 <strong>{CREADORES_CON_IA.timeLabel}</strong>
            </span>
            <span>
              👥 <strong>Máximo {CREADORES_CON_IA.capacity} niños</strong>
            </span>
          </div>

          {abierto ? (
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <a
                href={WHATSAPP(CREADORES_CON_IA.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Apartar el cupo por WhatsApp
              </a>
              <a href="#que-hace" className="btn btn-outline">
                Ver qué hace cada día
              </a>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-gray-600 mb-4">
                Las inscripciones de este taller ya cerraron.
              </p>
              <a
                href={WHATSAPP('¡Hola INVENTIA! Quiero que me avisen del próximo taller de Creadores con IA.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Avísenme del próximo
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Por qué ahora. El dato de PISA es público y verificable; se cita como
          contexto, no como amenaza. */}
      <section className="section bg-white">
        <div className="section-container max-w-4xl">
          <h2 className="text-3xl font-heading font-bold mb-4 text-center">
            Ya la están usando. Nadie les ha enseñado cómo.
          </h2>
          <p className="text-lg text-gray-600 text-center mb-10">
            Más de la mitad de los estudiantes colombianos de 15 años dice usar inteligencia
            artificial para sus tareas. La pregunta de este diciembre no es si su hijo la va a usar
            —ya la usa—, sino si va a entenderla o solo a obedecerle.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 border-l-4 border-l-gray-300">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                Usar la IA
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>· Le pide la respuesta y la copia.</li>
                <li>· Cree lo que le diga, aunque esté mal.</li>
                <li>· No sabe explicar de dónde salió lo que entregó.</li>
                <li>· En el examen, sin internet, no le sirve de nada.</li>
              </ul>
            </div>
            <div className="card p-6 border-l-4 border-l-secondary-500">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary-600 mb-2">
                Entenderla
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>· Sabe con qué datos aprendió y por qué se equivoca.</li>
                <li>· Escribe instrucciones precisas y corrige el resultado.</li>
                <li>· Verifica antes de entregar, y deja constancia de cómo la usó.</li>
                <li>· La usa para construir algo que antes no existía.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Los cuatro días. Cada tarjeta dice lo que HACE el niño, no lo que el
          profesor explica — es la diferencia entre un temario y una promesa. */}
      <section id="que-hace" className="section bg-gray-50">
        <div className="section-container max-w-4xl">
          <h2 className="text-3xl font-heading font-bold mb-3 text-center">
            Cuatro mañanas, un proyecto terminado
          </h2>
          <p className="text-gray-600 text-center mb-10">
            {CREADORES_TOTAL_HOURS} horas en vivo. No son charlas: cada día sale con algo hecho.
          </p>

          <div className="space-y-4">
            {CREADORES_DAYS.map((dia) => (
              <div key={dia.day} className="card p-6 flex gap-5 items-start">
                <div className="shrink-0 w-14 h-14 rounded-full bg-secondary-100 text-secondary-700 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold leading-none">Día</span>
                  <span className="text-xl font-bold leading-tight">{dia.day}</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
                    {dia.dateLabel} · {CREADORES_CON_IA.timeLabel}
                  </p>
                  <h3 className="text-lg font-heading font-bold mb-2">{dia.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{dia.does}</p>
                  <p className="text-xs text-gray-400">Del currículo INVENTIA: {dia.from}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 text-center mt-8 max-w-2xl mx-auto">
            El contenido no es improvisado para las vacaciones: son los módulos de inteligencia
            artificial del programa regular de INVENTIA, concentrados en cuatro mañanas.
          </p>
        </div>
      </section>

      {/* Qué incluye + precio. Van juntos a propósito: el precio se lee después
          de la lista, no antes. */}
      <section id="precio" className="section bg-white">
        <div className="section-container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-5">Qué incluye</h2>
              <ul className="space-y-3">
                {CREADORES_INCLUDES.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-700 text-sm">
                    <span className="text-primary-600 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-7 border-t-4 border-t-secondary-500">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
                Inversión
              </p>
              <p className="text-4xl font-heading font-bold text-gray-900">
                {formatCOP(CREADORES_CON_IA.priceCOP)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {CREADORES_TOTAL_HOURS} horas en vivo · sale en {formatCOP(precioPorHora)} la hora
              </p>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-sm">
                <p className="text-gray-700">
                  <strong>{formatCOP(CREADORES_CON_IA.familyPriceCOP)}</strong> si su hijo ya está
                  en la Sala de Tareas, en un curso de INVENTIA, o si venía del campamento que
                  cancelamos.
                </p>
                <p className="text-gray-600">
                  Se aparta el cupo con <strong>{formatCOP(CREADORES_CON_IA.depositCOP)}</strong> y
                  el saldo se paga antes del {CREADORES_CON_IA.balanceDeadlineLabel}. Transferencia
                  o Nequi.
                </p>
                <p className="text-gray-500 text-xs">
                  Una clase particular en Bogotá cuesta en promedio $26.425 la hora y termina
                  cuando termina la hora. Aquí quedan un proyecto, un certificado y un perfil
                  publicado.
                </p>
              </div>

              {abierto && (
                <a
                  href={WHATSAPP(CREADORES_CON_IA.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full mt-6"
                >
                  Apartar el cupo
                </a>
              )}
              <p className="text-xs text-gray-400 text-center mt-3">
                Quedan cupos para {CREADORES_CON_IA.capacity} niños en total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas. Son las objeciones reales, respondidas sin adornos — incluida
          la de "no compre si va a faltar dos días". */}
      <section className="section bg-gray-50">
        <div className="section-container max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">Preguntas</h2>
          <div className="space-y-4">
            {CREADORES_FAQ.map((item) => (
              <div key={item.q} className="card p-6">
                <h3 className="font-heading font-bold mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre. Un solo botón: el de WhatsApp, que es el canal por el que de
          verdad se cierra la venta mientras no haya pasarela en producción. */}
      <section className="section pb-24 md:pb-12 bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {abierto ? 'Son ocho cupos' : 'El próximo taller'}
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            {abierto
              ? `${CREADORES_CON_IA.datesLabel}, de ${CREADORES_CON_IA.timeLabel}, en línea. Escríbanos y le contamos si su hijo encaja en el grupo antes de que pague nada.`
              : 'Escríbanos y le avisamos en cuanto abramos la siguiente fecha.'}
          </p>
          <a
            href={WHATSAPP(
              abierto
                ? CREADORES_CON_IA.whatsappMessage
                : '¡Hola INVENTIA! Quiero que me avisen del próximo taller de Creadores con IA.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-white text-secondary-700 hover:bg-gray-100"
          >
            Escribir por WhatsApp
          </a>
          <p className="text-sm text-white/80 mt-6">
            ¿Su hijo necesita ayuda con las tareas del colegio, no un taller de vacaciones?{' '}
            <Link href="/asesoria-tareas" className="underline font-semibold">
              Mire la Sala de Tareas
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
