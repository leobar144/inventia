import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'
import { getCachedUser } from '@/lib/supabase/server'
import {
  getChildById,
  getActiveCurriculumLevelsForChild,
  getProjectsForChild,
} from '@/lib/supabase/portal-queries'
import { LEARNING_TOOLS } from '@/lib/learningTools'
import ProjectsSection from '@/components/portal/ProjectsSection'

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

export default async function AulaPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const {
    data: { user },
  } = await getCachedUser()

  if (!user) notFound()

  const child = await getChildById(childId, user.id)
  if (!child) notFound()

  const [activeLevels, projects] = await Promise.all([
    getActiveCurriculumLevelsForChild(childId),
    getProjectsForChild(childId),
  ])

  const age = calculateAge(child.birth_date)

  // Si el niño está inscrito en un curso con nivel del currículo asignado,
  // filtramos a las herramientas de ese nivel. Si no (curso sin nivel, o
  // todavía sin inscripción activa), mostramos todas ordenadas por edad.
  const hasLevelData = activeLevels.length > 0
  const tools = hasLevelData
    ? LEARNING_TOOLS.filter((t) => t.relevantLevels.some((l) => activeLevels.includes(l)))
    : [...LEARNING_TOOLS].sort((a, b) => {
        const aFits = age >= a.minAge
        const bFits = age >= b.minAge
        return aFits === bFits ? 0 : aFits ? -1 : 1
      })

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/portal/hijos/${child.id}`}
          className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2"
        >
          <FaArrowLeft size={12} /> {child.full_name}
        </Link>
        <h1 className="text-3xl font-heading font-bold">🚀 Aula INVENTIA</h1>
        <p className="text-gray-600">
          Las herramientas que {child.full_name} usa en sus clases, todas desde un solo lugar.
        </p>
      </div>

      {tools.length === 0 ? (
        <p className="text-gray-600">
          Todavía no hay herramientas asignadas al curso de {child.full_name}.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{tool.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                  Herramienta externa
                </span>
              </div>
              <h2 className="text-lg font-bold mb-1">{tool.name}</h2>
              <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5 mb-4">
                💡 {tool.firstStepsTip}
              </p>

              <div className="mt-auto space-y-2">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-sm w-full justify-center"
                >
                  Abrir {tool.name} <FaExternalLinkAlt className="ml-2" size={11} />
                </a>

                {/* Nuestro espacio dentro de la herramienta. Es la forma
                    legítima de que el niño encuentre la marca INVENTIA sin que
                    intentemos personalizar una plataforma que no es nuestra. */}
                {tool.inventiaSpace && (
                  <a
                    href={tool.inventiaSpace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border-2 border-primary-200 bg-primary-50 p-3 hover:border-primary-400 transition-colors"
                  >
                    <p className="text-sm font-bold text-primary-700">
                      🚀 {tool.inventiaSpace.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{tool.inventiaSpace.hint}</p>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marca INVENTIA dentro de las herramientas: no se pueden personalizar
          Scratch ni Code.org, pero sí lo que el niño construye adentro. */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-1">Pon a NIT en tus proyectos</h2>
        <p className="text-sm text-gray-600 mb-4">
          Descarga a nuestro robot y el fondo de INVENTIA, y súbelos a Scratch para que tus
          creaciones lleven nuestra marca.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="/marca/nit-sprite.svg"
            download
            className="rounded-xl border border-gray-200 p-4 hover:border-primary-300 transition-colors flex items-center gap-3"
          >
            <span className="text-3xl">🤖</span>
            <span>
              <span className="block font-medium text-sm">NIT, el robot</span>
              <span className="block text-xs text-gray-500">
                Súbelo como disfraz en Scratch
              </span>
            </span>
          </a>
          <a
            href="/marca/fondo-inventia.svg"
            download
            className="rounded-xl border border-gray-200 p-4 hover:border-primary-300 transition-colors flex items-center gap-3"
          >
            <span className="text-3xl">🖼️</span>
            <span>
              <span className="block font-medium text-sm">Fondo INVENTIA</span>
              <span className="block text-xs text-gray-500">Súbelo como escenario</span>
            </span>
          </a>
        </div>
      </section>

      <ProjectsSection childId={child.id} projects={projects} />
    </div>
  )
}
