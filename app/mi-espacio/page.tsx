import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getEspacioByCode } from '@/lib/supabase/espacio-queries'
import { getBadgeProgress } from '@/lib/badges'
import {
  COOKIE_ESPACIO,
  calcularMisionSiguiente,
  misionCompleta,
  primerNombre,
  MISION_BIENVENIDA,
} from '@/lib/espacio'
import EntrarConCodigo from '@/components/espacio/EntrarConCodigo'
import MisionBienvenida from '@/components/espacio/MisionBienvenida'

export const metadata: Metadata = {
  title: 'Mi espacio — INVENTIA',
  description: 'El espacio del estudiante de INVENTIA.',
  // No tiene nada que hacer en Google: es la página de un niño en particular.
  robots: { index: false, follow: false },
}

export default async function MiEspacioPage() {
  const store = await cookies()
  const codigo = store.get(COOKIE_ESPACIO)?.value
  const espacio = codigo ? await getEspacioByCode(codigo) : null

  // Sin código válido, la puerta. Pasa también cuando el código dejó de existir
  // (el acudiente lo regeneró), y por eso se revalida en cada carga.
  if (!espacio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="text-6xl mb-4" aria-hidden="true">
          🚀
        </div>
        <h1 className="text-3xl font-heading font-bold mb-2 text-center">Mi espacio</h1>
        <p className="text-gray-600 mb-8 text-center">Aquí está todo lo que has construido.</p>
        <EntrarConCodigo />
      </div>
    )
  }

  const nombre = primerNombre(espacio.fullName)
  const badge = getBadgeProgress(espacio.classesCompleted)
  const completa = misionCompleta(espacio.pasos)

  const mision = calcularMisionSiguiente({
    nombre,
    pasos: espacio.pasos,
    proximaClase: espacio.proximaClase,
    clasesCompletadas: espacio.classesCompleted,
    clasesParaSiguienteInsignia: badge.classesUntilNext,
    siguienteInsignia: badge.next?.name ?? null,
    proyectos: espacio.proyectos,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="mb-8">
          <p className="text-sm font-bold text-secondary-600 uppercase tracking-wide">Mi espacio</p>
          <h1 className="text-4xl font-heading font-bold">¡Hola, {nombre}!</h1>
        </header>

        {/* Lo único que importa: qué hago ahora. Va primero, grande y solo. */}
        <section className="card p-7 mb-6 border-l-4 border-l-secondary-500">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
            Lo que sigue
          </p>
          <div className="flex gap-4 items-start">
            <span className="text-4xl shrink-0" aria-hidden="true">
              {mision.emoji}
            </span>
            <div>
              <h2 className="text-2xl font-heading font-bold leading-tight">{mision.titulo}</h2>
              <p className="text-gray-600 mt-1 first-letter:uppercase">{mision.detalle}</p>
              {mision.href && (
                <a
                  href={mision.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-4"
                >
                  {mision.hrefLabel}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* La misión de bienvenida desaparece cuando se completa: un paso ya
            hecho que sigue ocupando la pantalla deja de ser un logro. */}
        {!completa && (
          <div className="mb-6">
            <MisionBienvenida pasos={espacio.pasos} suenoActual={espacio.sueno} />
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <section className="card p-6 text-center">
            <p className="text-5xl mb-2" aria-hidden="true">
              {badge.current?.icon ?? '🥚'}
            </p>
            <p className="font-bold">{badge.current?.name ?? 'Aún sin insignia'}</p>
            {badge.next && badge.classesUntilNext ? (
              <p className="text-sm text-gray-500 mt-1">
                {badge.classesUntilNext === 1
                  ? 'Te falta 1 clase'
                  : `Te faltan ${badge.classesUntilNext} clases`}{' '}
                para {badge.next.name}
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                {completa ? '¡Ya tienes tu insignia!' : 'Termina tu misión para empezar'}
              </p>
            )}
          </section>

          <section className="card p-6 text-center">
            <p className="text-5xl mb-2" aria-hidden="true">
              🎒
            </p>
            <p className="font-bold">
              {espacio.classesCompleted}{' '}
              {espacio.classesCompleted === 1 ? 'clase hecha' : 'clases hechas'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {espacio.proyectos === 0
                ? 'Ningún proyecto todavía'
                : `${espacio.proyectos} ${espacio.proyectos === 1 ? 'proyecto' : 'proyectos'} publicados`}
            </p>
          </section>
        </div>

        {completa && (
          <section className="card p-6">
            <h2 className="text-lg font-bold mb-2">Tu misión de bienvenida</h2>
            <ul className="space-y-1 text-sm text-gray-500">
              {MISION_BIENVENIDA.map((p) => (
                <li key={p.id}>✓ {p.titulo}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          ¿Este no es tu espacio?{' '}
          <a href="/api/mi-espacio/salir" className="underline">
            Salir
          </a>
        </p>
      </div>
    </div>
  )
}
