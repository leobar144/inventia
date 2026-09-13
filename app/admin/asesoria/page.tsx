import Link from 'next/link'
import { getTutoringOverview, getTutoringPlans } from '@/lib/supabase/tutoring-queries'
import { getAllInstructors } from '@/lib/supabase/admin-queries'
import {
  MONITOR_HOURLY_COP,
  MONITOR_ATTENTION_LIMIT,
  TUTORING_BLOCK_HOURS,
} from '@/lib/economics'
import { SALA_DE_TAREAS, STUCK_WINDOW } from '@/lib/homework'
import TutoringBlockForm from '@/components/admin/TutoringBlockForm'
import TutoringMonitorAssign from '@/components/admin/TutoringMonitorAssign'
import InviteInstructorForm from '@/components/admin/InviteInstructorForm'

export const metadata = { title: 'Sala de Tareas' }

function formatCOP(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`
}

function formatBlock(startsAt: string, endsAt: string): string {
  const day = new Date(startsAt).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Bogota',
  })
  const hour = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Bogota',
    })
  return `${day} · ${hour(startsAt)}–${hour(endsAt)}`
}

const HEALTH_STYLES: Record<string, string> = {
  sano: 'bg-primary-100 text-primary-700',
  justo: 'bg-accent-100 text-accent-700',
  critico: 'bg-red-100 text-red-700',
}

export default async function AdminAsesoriaPage() {
  const [overview, plans, instructors] = await Promise.all([
    getTutoringOverview(),
    getTutoringPlans(),
    getAllInstructors(),
  ])

  const monitorCost = MONITOR_HOURLY_COP * TUTORING_BLOCK_HOURS

  // Rango por defecto para asignar monitor: de hoy al final de lo programado.
  const hoy = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const ultimaTarde =
    overview.upcomingBlocks.length > 0
      ? overview.upcomingBlocks[overview.upcomingBlocks.length - 1].starts_at.slice(0, 10)
      : hoy

  const sinMonitor = overview.upcomingBlocks.filter((b) => !b.monitorName).length

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">📚 {SALA_DE_TAREAS.name}</h1>
          <p className="text-gray-600">
            Mensualidades, tardes programadas y niños que necesitan refuerzo.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <InviteInstructorForm />
          <TutoringBlockForm monitors={instructors} />
        </div>
      </div>

      {/* Equipo de la sala.
          Va arriba porque una tarde sin monitor es una tarde que no se puede
          dictar: es más urgente que cualquier número de esta página. */}
      <section className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">Quién acompaña cada tarde</h2>
            <p className="text-sm text-gray-500">
              {instructors.length === 0
                ? 'Todavía no hay profesores en el sistema. Invítelos con el botón de arriba: les llega un correo para poner su contraseña.'
                : `${instructors.length} profesor(es) disponibles. Se asignan por modalidad y rango de fechas.`}
            </p>
          </div>
          <TutoringMonitorAssign
            monitors={instructors}
            defaultFrom={hoy}
            defaultTo={ultimaTarde}
          />
        </div>

        {sinMonitor > 0 && (
          <p className="text-sm text-accent-700 bg-accent-50 border border-accent-200 rounded-lg p-3">
            <strong>{sinMonitor} de las próximas tardes no tienen monitor.</strong> Nadie las puede
            dictar y no aparecen en la vista de ningún profesor.
          </p>
        )}
      </section>

      {/* Alertas primero: es lo único aquí que pide una llamada telefónica. */}
      {overview.alerts.length > 0 && (
        <section className="rounded-xl border-2 border-accent-300 bg-accent-50 p-6">
          <h2 className="text-lg font-bold mb-1">Niños atascados en un tema</h2>
          <p className="text-sm text-gray-600 mb-4">
            El mismo tema trabado 3 o más veces en las últimas {STUCK_WINDOW} tardes. Llamar a la
            familia antes del próximo examen es justo lo que nos separa de un centro de refuerzo.
          </p>
          <div className="space-y-3">
            {overview.alerts.map((alert) => (
              <div key={alert.childId} className="bg-white rounded-lg p-4 border border-accent-200">
                <p className="font-bold">{alert.childName}</p>
                {alert.topics.map((topic) => (
                  <p key={topic.subjectId} className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">{topic.subjectLabel}</span> ({topic.times}×):{' '}
                    {topic.notes.slice(0, 2).join(' · ')}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Números */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Mensualidades activas</p>
          <p className="text-3xl font-heading font-bold">{overview.activeMemberships}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Ingreso mensual comprometido</p>
          <p className="text-3xl font-heading font-bold text-primary-600">
            {formatCOP(overview.monthlyRevenue)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Costo del monitor por tarde</p>
          <p className="text-3xl font-heading font-bold">{formatCOP(monitorCost)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatCOP(MONITOR_HOURLY_COP)}/hora × {TUTORING_BLOCK_HOURS} horas
          </p>
        </div>
      </section>

      {/* Planes vigentes */}
      <section>
        <h2 className="text-xl font-bold mb-4">Planes</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="px-4 py-3 font-medium text-gray-600">Tardes/mes</th>
                <th className="px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="px-4 py-3 font-medium text-gray-600">Aporta por tarde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.sessions_included}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {plan.price === null ? (
                      <span className="text-accent-600 font-medium">Sin definir</span>
                    ) : (
                      formatCOP(plan.price)
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {plan.price === null
                      ? '—'
                      : formatCOP(plan.price / plan.sessions_included)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Los precios viven en la tabla <code>tutoring_plans</code>. Para cambiarlos no hay que
          desplegar nada.
        </p>
        {plans.some((p) => p.price === null) && (
          <p className="text-sm text-accent-700 bg-accent-50 border border-accent-200 rounded-lg p-3 mt-3">
            <strong>Hay planes sin precio.</strong> La página pública los muestra sin cifra y con un
            botón de “Consultar precio” por WhatsApp, y el checkout se niega a cobrarlos. Apenas
            escriba el precio en <code>tutoring_plans</code>, la cifra y el botón de inscripción
            aparecen solos.
          </p>
        )}
      </section>

      {/* Tardes programadas */}
      <section>
        <h2 className="text-xl font-bold mb-1">Próximas tardes</h2>
        <p className="text-sm text-gray-500 mb-4">
          El margen asume que asisten todos los niños con mensualidad activa. Es el mejor caso, y
          sirve para decidir si vale la pena abrir la tarde.
        </p>

        {overview.upcomingBlocks.length === 0 ? (
          <p className="card p-6 text-gray-600">
            No hay tardes programadas. Use “Programar tardes” para crear el horario de la sala.
          </p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Tarde</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Modalidad</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Monitor</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Niños</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.upcomingBlocks.map((block) => (
                  <tr key={block.id}>
                    <td className="px-4 py-3 font-medium capitalize">
                      {formatBlock(block.starts_at, block.ends_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {block.modality === 'virtual' ? '💻 Virtual' : '🏫 Presencial'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {block.monitorName ?? (
                        <span className="text-accent-600 font-medium">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {block.capacity === null ? (
                        <>
                          {block.attendees}{' '}
                          <span className="text-gray-400">· sin límite</span>
                        </>
                      ) : (
                        `${block.attendees} / ${block.capacity}`
                      )}
                      {block.economics.needsSecondMonitor && (
                        <p className="text-xs text-accent-700 font-medium mt-1">
                          Se necesita un segundo monitor
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          HEALTH_STYLES[block.economics.health]
                        }`}
                      >
                        {formatCOP(block.economics.marginPerBlock)} (
                        {Math.round(block.economics.marginPercent)}%)
                      </span>
                      {block.economics.attendeesToBreakEven > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Faltan {block.economics.attendeesToBreakEven} para no perder
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-sm text-gray-500">
        Las tardes virtuales no tienen cupo: caben todos los que tengan mensualidad. Pero por
        encima de {MONITOR_ATTENTION_LIMIT} niños un solo monitor ya no alcanza a sentarse con
        cada uno ni a escribir su bitácora, que es justo lo que se cobró — por eso el aviso.
      </p>

      <p className="text-sm text-gray-500">
        Los monitores marcan asistencia y escriben la bitácora en{' '}
        <Link href="/profesor/tareas" className="text-primary-600 font-medium hover:underline">
          Profesores → Sala de Tareas
        </Link>
        .
      </p>
    </div>
  )
}
