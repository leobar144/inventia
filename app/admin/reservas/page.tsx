import { getAllBookings } from '@/lib/supabase/trial-queries'
import { FaWhatsapp } from 'react-icons/fa'

const COURSE_LABELS: Record<string, string> = {
  scratch: 'Scratch & Bloques',
  python: 'Python & Código Real',
  robotica: 'Robótica',
  ia: 'IA & Futuro',
  no_seguro: 'No está seguro todavía',
}

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default async function AdminReservasPage() {
  const bookings = await getAllBookings()

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = bookings.filter((b) => b.booking_date >= today)
  const past = bookings.filter((b) => b.booking_date < today)

  const renderRow = (b: (typeof bookings)[number]) => (
    <tr key={b.id} className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium">{b.child_name}</p>
        <p className="text-sm text-gray-500">{b.child_age} años</p>
      </td>
      <td className="px-4 py-3 text-sm">
        {COURSE_LABELS[b.course_interest ?? ''] ?? b.course_interest ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm">
        {new Date(`${b.booking_date}T00:00:00`).toLocaleDateString('es-CO', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })}
        {b.trial_availability && ` · ${formatTimeLabel(b.trial_availability.time)}`}
      </td>
      <td className="px-4 py-3 text-sm">
        <p>{b.parent_name}</p>
        <a
          href={`https://wa.me/57${b.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline inline-flex items-center gap-1"
        >
          <FaWhatsapp /> {b.whatsapp}
        </a>
        {b.parent_email && <p className="text-gray-500">{b.parent_email}</p>}
      </td>
    </tr>
  )

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-heading font-bold">Reservas de clase de prueba</h1>
        <p className="text-gray-600">{bookings.length} reservas en total</p>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Próximas ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-600">No hay reservas próximas.</p>
        ) : (
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Niño/a</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Curso</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Horario</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Contacto</th>
                </tr>
              </thead>
              <tbody>{upcoming.map(renderRow)}</tbody>
            </table>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Pasadas ({past.length})</h2>
          <div className="card overflow-hidden overflow-x-auto opacity-70">
            <table className="w-full text-left">
              <tbody>{past.map(renderRow)}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
