import Image from 'next/image'
import type { MiembroEquipo } from '@/lib/equipo'

/**
 * La cara de quien va a recibir al niño.
 *
 * Va donde el papá decide: en la página de la clase de prueba, justo antes del
 * formulario. "Quién le va a enseñar a mi hijo" es la pregunta que queda cuando
 * ya entendió el precio y el horario.
 */
export default function FichaInstructor({
  persona,
  titulo,
}: {
  persona: MiembroEquipo
  titulo?: string
}) {
  return (
    <section className="card p-6 sm:p-7">
      {titulo && (
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">{titulo}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
        <Image
          src={persona.foto}
          alt={persona.fotoAlt}
          width={112}
          height={112}
          className="rounded-2xl object-cover shrink-0"
        />

        <div>
          <h3 className="text-lg font-heading font-bold leading-tight">{persona.nombre}</h3>
          <p className="text-sm text-primary-600 font-medium mb-3">{persona.rol}</p>
          <p className="text-gray-600 text-sm leading-relaxed">{persona.bio}</p>
        </div>
      </div>
    </section>
  )
}
