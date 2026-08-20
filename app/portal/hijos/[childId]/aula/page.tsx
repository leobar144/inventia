import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'
import { createClient } from '@/lib/supabase/server'
import { getChildById } from '@/lib/supabase/portal-queries'
import { LEARNING_TOOLS } from '@/lib/learningTools'

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const child = await getChildById(childId, user.id)
  if (!child) notFound()

  const age = calculateAge(child.birth_date)
  const tools = [...LEARNING_TOOLS].sort((a, b) => {
    const aFits = age >= a.minAge
    const bFits = age >= b.minAge
    return aFits === bFits ? 0 : aFits ? -1 : 1
  })

  return (
    <div className="space-y-6">
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

      <div className="grid sm:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const fitsAge = age >= tool.minAge
          return (
            <div key={tool.id} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{tool.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                  Herramienta externa
                </span>
              </div>
              <h2 className="text-lg font-bold mb-1">{tool.name}</h2>
              <p className="text-sm text-gray-600 mb-3 flex-1">{tool.description}</p>
              <p className="text-xs text-gray-400 mb-4">
                {fitsAge ? `Recomendado desde ${tool.minAge} años` : `A partir de ${tool.minAge} años`}
              </p>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-sm"
              >
                Abrir {tool.name} <FaExternalLinkAlt className="ml-2" size={11} />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
