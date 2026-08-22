'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/constants'
import { getLevelForAge } from '@/lib/curriculum'

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

/**
 * Contacto centrado en WhatsApp, que es donde de verdad ocurre la conversación
 * en Colombia — un formulario más es donde los interesados se pierden.
 *
 * La idea: el padre elige la edad de su hijo y ANTES de escribir ya recibe la
 * respuesta a su pregunta más frecuente ("¿esto sirve para mi hijo?"). El
 * mensaje de WhatsApp sale prellenado con ese contexto, así que no tiene que
 * pensar qué escribir ni nosotros preguntar lo mismo de vuelta.
 */
export default function ContactSection() {
  const [age, setAge] = useState<number | null>(null)
  const level = age !== null ? getLevelForAge(age) : null

  const message = level
    ? `Hola INVENTIA 👋 Tengo un hijo/a de ${age} años y quiero saber más sobre ${level.name}.`
    : 'Hola INVENTIA 👋 Quiero saber más sobre sus programas.'

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <section id="contacto" className="section bg-gray-50">
      <div className="section-container max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Hablamos?</h2>
          <p className="text-xl text-gray-600">
            Dinos la edad de tu hijo/a y te decimos exactamente por dónde empezar.
          </p>
        </div>

        <div className="card p-8">
          <p className="text-sm font-medium text-gray-700 mb-3">
            ¿Cuántos años tiene tu hijo/a?
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {AGES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAge(a === age ? null : a)}
                aria-pressed={a === age}
                className={`w-11 h-11 rounded-xl border-2 font-bold transition-colors ${
                  a === age
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-primary-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {level ? (
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 p-6 mb-6">
              <p className="text-sm text-primary-700 font-bold uppercase tracking-wide mb-1">
                A los {age} años le corresponde
              </p>
              <h3 className="text-2xl font-heading font-bold mb-2">{level.name}</h3>
              <p className="text-gray-700 mb-3">{level.focus}</p>
              <p className="text-sm text-gray-600">
                <strong>Se pregunta:</strong> {level.orientingQuestion}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Trabaja con:</strong> {level.tools}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Elige una edad arriba y te mostramos el nivel que le corresponde, con las
              herramientas que va a usar.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary justify-center"
            >
              <FaWhatsapp className="mr-2" size={18} />
              {level ? 'Preguntar por WhatsApp' : 'Escribirnos por WhatsApp'}
            </a>
            <Link href="/clase-de-prueba" className="btn btn-outline justify-center">
              Clase de prueba gratis <FaArrowRight className="ml-2" size={13} />
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Respondemos por WhatsApp en horario laboral, normalmente el mismo día.
          </p>
        </div>

        {/* Canales secundarios */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6 text-center">
          <a
            href={`mailto:${SITE_CONFIG.contact.email}`}
            className="card p-5 hover:border-primary-300 transition-colors"
          >
            <FaEnvelope className="mx-auto text-primary-500 mb-2" size={20} />
            <p className="text-sm font-medium">Correo</p>
            <p className="text-xs text-gray-500 break-all">{SITE_CONFIG.contact.email}</p>
          </a>

          <div className="card p-5">
            <FaMapMarkerAlt className="mx-auto text-primary-500 mb-2" size={20} />
            <p className="text-sm font-medium">Dónde estamos</p>
            <p className="text-xs text-gray-500">Bogotá · presencial y virtual</p>
          </div>

          <Link href="/instituciones" className="card p-5 hover:border-primary-300 transition-colors">
            <span className="block text-xl mb-1">🏫</span>
            <p className="text-sm font-medium">¿Eres un jardín o colegio?</p>
            <p className="text-xs text-primary-600">Ver programa institucional →</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
