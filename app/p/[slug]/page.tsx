import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { getPublicChildProfile } from '@/lib/supabase/public-queries'
import { getBadgeProgress, BADGE_LEVELS } from '@/lib/badges'
import BadgeIcon from '@/components/BadgeIcon'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPublicChildProfile(slug)

  if (!profile) return { title: 'Perfil no disponible', robots: { index: false, follow: false } }

  return {
    title: `Mira lo que construyó ${profile.firstName} en INVENTIA`,
    description: `${profile.firstName} lleva ${profile.classesCompleted} clases creando con tecnología.`,
    // Compartible por enlace, pero NUNCA indexable: que un buscador liste los
    // perfiles de los niños sería exactamente lo que la política promete evitar.
    robots: { index: false, follow: false },
  }
}

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const profile = await getPublicChildProfile(slug)

  // Token inexistente y permiso revocado se tratan igual: 404. No se revela
  // cuál de los dos casos fue.
  if (!profile) notFound()

  const badge = getBadgeProgress(profile.classesCompleted)
  const nextLevel = BADGE_LEVELS.find((l) => l.threshold > profile.classesCompleted)

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card p-8 text-center">
          <p className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-2">
            Estudiante INVENTIA
          </p>
          <h1 className="text-4xl font-heading font-bold mb-6">{profile.firstName}</h1>

          {badge.current ? (
            <div className="flex flex-col items-center">
              <BadgeIcon level={badge.current} size="lg" />
              <p className="text-xl font-bold mt-4">
                {badge.current.icon} {badge.current.name}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
                🌱
              </div>
              <p className="text-xl font-bold mt-4">Apenas empezando</p>
            </div>
          )}

          <p className="text-gray-600 mt-3">
            <strong className="text-2xl text-gray-900">{profile.classesCompleted}</strong> clase
            {profile.classesCompleted === 1 ? '' : 's'} completada
            {profile.classesCompleted === 1 ? '' : 's'}
          </p>

          {nextLevel && (
            <p className="text-sm text-gray-500 mt-2">
              Le faltan {nextLevel.threshold - profile.classesCompleted} para{' '}
              {nextLevel.icon} {nextLevel.name}
            </p>
          )}
        </div>

        {profile.projects.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-1">Sus proyectos</h2>
            <p className="text-sm text-gray-600 mb-5">
              Cosas que {profile.firstName} construyó desde cero.
            </p>
            <div className="space-y-3">
              {profile.projects.map((project) => (
                <a
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 hover:border-primary-300 transition-colors"
                >
                  <span className="font-medium">{project.title}</span>
                  <FaExternalLinkAlt className="text-primary-500 shrink-0" size={13} />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-gradient-to-r from-secondary-600 to-primary-600 text-white p-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">
            Tu hijo no usa tecnología. La inventa.
          </h2>
          <p className="mb-6 text-primary-50">
            Robótica, programación e IA para niños de 4 a 16 años, en grupos de máximo 8.
          </p>
          <Link href="/clase-de-prueba" className="btn bg-white text-primary-700 hover:bg-gray-100">
            Agendar una clase de prueba gratis
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">
          Esta página la comparte la familia de {profile.firstName} y puede desactivarla cuando
          quiera.
        </p>
      </div>
    </div>
  )
}
