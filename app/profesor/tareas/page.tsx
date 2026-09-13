import { redirect } from 'next/navigation'
import { createClient, getCachedUser } from '@/lib/supabase/server'
import { getBlocksForMonitor } from '@/lib/supabase/tutoring-queries'
import { SALA_DE_TAREAS } from '@/lib/homework'
import TutoringChildRow from '@/components/profesor/TutoringChildRow'

export const metadata = { title: 'Sala de Tareas' }

function formatBlockDay(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Bogota',
  })
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
}

function isToday(iso: string): boolean {
  const bogota = (d: Date) =>
    new Date(d.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return bogota(new Date(iso)) === bogota(new Date())
}

export default async function ProfesorTareasPage() {
  const {
    data: { user },
  } = await getCachedUser()

  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // El administrador ve todas las tardes; un monitor solo las suyas.
  const blocks = await getBlocksForMonitor(profile?.role === 'admin' ? null : user.id)

  const today = blocks.filter((b) => isToday(b.starts_at))
  const upcoming = blocks.filter((b) => !isToday(b.starts_at))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">📚 {SALA_DE_TAREAS.name}</h1>
        <p className="text-gray-600">
          Marque quién llegó y deje el registro de cada niño. La familia lo ve el mismo día.
        </p>
      </div>

      {blocks.length === 0 && (
        <p className="card p-6 text-gray-600">
          No hay tardes de sala programadas para usted en los próximos días.
        </p>
      )}

      {today.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Hoy</h2>
          <div className="space-y-6">
            {today.map((block) => (
              <BlockCard key={block.id} block={block} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Próximas tardes</h2>
          <div className="space-y-3">
            {upcoming.map((block) => (
              <div key={block.id} className="card p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium capitalize">{formatBlockDay(block.starts_at)}</p>
                  <p className="text-sm text-gray-500">
                    {formatHour(block.starts_at)} – {formatHour(block.ends_at)} ·{' '}
                    {block.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {block.children.length} niño(s) con mensualidad activa
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BlockCard({
  block,
}: {
  block: Awaited<ReturnType<typeof getBlocksForMonitor>>[number]
}) {
  const marked = block.children.filter((c) => c.attendance).length

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold capitalize">{formatBlockDay(block.starts_at)}</h3>
          <p className="text-sm text-gray-500">
            {formatHour(block.starts_at)} – {formatHour(block.ends_at)} ·{' '}
            {block.modality === 'virtual' ? 'Virtual' : 'Presencial'} ·{' '}
            {block.capacity === null ? 'cupo abierto' : `cupo ${block.capacity}`}
          </p>
        </div>
        <span className="text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
          {marked} de {block.children.length} marcados
        </span>
      </div>

      {block.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{block.notes}</p>
      )}

      {block.children.length === 0 ? (
        <p className="text-sm text-gray-500">
          Ningún niño tiene mensualidad activa todavía.
        </p>
      ) : (
        <div className="space-y-3">
          {block.children.map((child) => (
            <TutoringChildRow
              key={child.id}
              blockId={block.id}
              childId={child.id}
              childName={child.fullName}
              planName={child.planName}
              initial={{
                present: Boolean(child.attendance),
                subjects: child.attendance?.subjects ?? [],
                whatWasDone: child.attendance?.what_was_done ?? null,
                stuckOn: child.attendance?.stuck_on ?? null,
                aiUse: child.attendance?.ai_use ?? 'no',
                aiNote: child.attendance?.ai_note ?? null,
                homeworkCompleted: child.attendance?.homework_completed ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
