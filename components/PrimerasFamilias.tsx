import Image from 'next/image'
import { FAMILIAS_PUBLICABLES } from '@/lib/familias'

/**
 * Las primeras familias.
 *
 * Con una sola familia, la tentación es esconderla hasta tener diez. Se hace lo
 * contrario: se dice que acabamos de abrir en Bogotá y que estas son las
 * primeras. Para un papá que duda, "son los primeros" no es una debilidad —
 * significa que a su hijo lo van a atender de verdad.
 *
 * Es además el reemplazo honesto de la galería que se quitó el 3/10/2026, que
 * mostraba fotos bajadas de internet diciendo que eran alumnos reales.
 */
export default function PrimerasFamilias() {
  if (FAMILIAS_PUBLICABLES.length === 0) return null

  return (
    <section className="section bg-white">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Las primeras familias</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            INVENTIA acaba de abrir en Bogotá. Estas son las familias que llegaron primero — y por
            eso mismo, las que tienen toda nuestra atención.
          </p>
        </div>

        {/* Con una familia la tarjeta va horizontal y ocupa el ancho; con
            varias, vertical en rejilla. Una tarjeta horizontal a media columna
            deja la foto y el texto apretados contra la línea del medio. */}
        <div
          className={
            FAMILIAS_PUBLICABLES.length === 1
              ? ''
              : 'grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto'
          }
        >
          {FAMILIAS_PUBLICABLES.map((familia) => {
            const unaSola = FAMILIAS_PUBLICABLES.length === 1
            return (
              <figure
                key={familia.id}
                className={`card overflow-hidden flex ${
                  unaSola ? 'flex-col sm:flex-row items-stretch' : 'flex-col'
                }`}
              >
                <Image
                  src={familia.foto}
                  alt={familia.fotoAlt}
                  width={400}
                  height={400}
                  // Cuadrada: con altura automática la tarjeta la achataba,
                  // porque el texto de al lado es corto.
                  className={
                    unaSola
                      ? 'w-full sm:w-72 h-64 sm:h-72 object-cover shrink-0'
                      : 'w-full h-56 object-cover'
                  }
                />

                <figcaption
                  className={`p-6 ${unaSola ? 'sm:p-8 flex flex-col justify-center' : ''}`}
                >
                  {familia.frase ? (
                    <blockquote className="text-lg text-gray-700 leading-relaxed mb-4">
                      «{familia.frase}»
                    </blockquote>
                  ) : (
                    <p className="text-gray-700 leading-relaxed mb-4">{familia.pie}</p>
                  )}

                  <p className="font-bold">{familia.nombre}</p>
                  {familia.programa && (
                    <p className="text-sm text-primary-600">{familia.programa}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    Publicada con autorización firmada de la familia.
                  </p>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
