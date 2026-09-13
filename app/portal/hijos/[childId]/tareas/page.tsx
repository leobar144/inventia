import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import { getCachedUser } from '@/lib/supabase/server'
import { getChildById } from '@/lib/supabase/portal-queries'
import { getChildTutoringSummary } from '@/lib/supabase/tutoring-queries'
import { getAiUse, subjectLabel, SALA_DE_TAREAS, STUCK_WINDOW } from '@/lib/homework'

export const metadata = { title: 'Sala de Tareas' }

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Bogota',
  })
}

export default async function TareasPage({
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

  const { membership, progress, attendances, stuckTopics } = await getChildTutoringSummary(
    childId,
    user.id
  )

  const firstName = child.full_name.trim().split(/\s+/)[0]

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/portal/hijos/${child.id}`}
          className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 mb-2"
        >
          <FaArrowLeft size={12} /> {child.full_name}
        </Link>
        <h1 className="text-3xl font-heading font-bold">📚 {SALA_DE_TAREAS.name}</h1>
        <p className="text-gray-600">Qué trabajó {firstName} cada tarde, tal como quedó anotado.</p>
      </div>

      {/* Alerta de tema atascado. Va ARRIBA de todo: es la única cosa de esta
          página que pide una decisión del papá, no solo información. */}
      {stuckTopics.length > 0 && (
        <section className="rounded-xl border-2 border-accent-300 bg-accent-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-accent-700 mb-2">
            Necesita refuerzo
          </p>
          {stuckTopics.map((topic) => (
            <div key={topic.subjectId} className="mb-4 last:mb-0">
              <p className="font-bold text-gray-800">
                {topic.subjectLabel} — se atascó {topic.times} de las últimas {STUCK_WINDOW} tardes
              </p>
              <ul className="mt-2 space-y-1">
                {topic.notes.map((note, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    · {note}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm text-gray-600 mt-3">
            Le escribimos para proponer cómo trabajarlo antes de la próxima evaluación.
          </p>
        </section>
      )}

      {/* Estado de la mensualidad */}
      {membership && progress ? (
        <section className="card p-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold">{membership.planName}</h2>
              <p className="text-sm text-gray-500">
                Vigente hasta el {formatDay(`${membership.endsOn}T12:00:00Z`)}
              </p>
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${
                membership.status === 'active'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {membership.status === 'active' ? 'Activa' : 'Pendiente de pago'}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-sm mb-1.5">
            <span className="text-gray-600">
              {progress.used} de {progress.included} tardes usadas
            </span>
            <span className="font-medium text-gray-700">
              Quedan {progress.remaining}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${Math.min(progress.percent, 100)}%` }}
            />
          </div>

          {progress.needsRenewal && membership.status === 'active' && (
            <p className="mt-4 text-sm bg-secondary-50 border border-secondary-200 rounded-lg p-3 text-gray-700">
              La mensualidad está por terminarse. Escríbanos por WhatsApp para renovarla y que{' '}
              {firstName} no pierda el ritmo.
            </p>
          )}
        </section>
      ) : (
        <section className="card p-6">
          <h2 className="text-lg font-bold mb-1">{firstName} todavía no está en la Sala</h2>
          <p className="text-sm text-gray-600 mb-4">
            {SALA_DE_TAREAS.scheduleLabel}. Acompañamiento en todas las materias del colegio, con
            reporte de cada tarde.
          </p>
          <Link href="/asesoria-tareas" className="btn btn-primary">
            Ver planes
          </Link>
        </section>
      )}

      {/* Bitácora */}
      <section>
        <h2 className="text-xl font-bold mb-4">Bitácora</h2>

        {attendances.length === 0 ? (
          <p className="text-gray-600 card p-6">
            Todavía no hay tardes registradas. Aparecen aquí el mismo día, apenas el monitor cierra
            la sesión.
          </p>
        ) : (
          <div className="space-y-4">
            {attendances.map((a) => {
              const ai = getAiUse(a.ai_use)
              return (
                <article key={a.id} className="card p-5">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <p className="font-bold capitalize">{formatDay(a.blockStartsAt)}</p>
                    {a.homework_completed !== null && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          a.homework_completed
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {a.homework_completed ? 'Terminó la tarea' : 'Quedó pendiente'}
                      </span>
                    )}
                  </div>

                  {a.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {a.subjects.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700"
                        >
                          {subjectLabel(s)}
                        </span>
                      ))}
                    </div>
                  )}

                  {a.what_was_done && (
                    <p className="text-sm text-gray-700 mb-3">{a.what_was_done}</p>
                  )}

                  {a.stuck_on && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">
                      <span className="font-medium">Se atascó en:</span> {a.stuck_on}
                    </p>
                  )}

                  {/* Declaración de IA. Se muestra siempre, incluso el "no usó":
                      el valor está en que el papá sepa que SIEMPRE se pregunta. */}
                  {ai && (
                    <div
                      className={`text-sm rounded-lg p-3 border ${
                        ai.tone === 'atencion'
                          ? 'border-accent-200 bg-accent-50'
                          : ai.tone === 'bueno'
                            ? 'border-primary-200 bg-primary-50'
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <p className="font-medium text-gray-800">
                        {ai.icon} Inteligencia artificial: {ai.label.toLowerCase()}
                      </p>
                      {a.ai_note && <p className="text-gray-600 mt-1">{a.ai_note}</p>}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
