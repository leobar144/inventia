import Link from 'next/link'
import { getDigitalWaitlist } from '@/lib/supabase/admin-queries'
import {
  ageBandLabel,
  buildWaitlistWhatsAppMessage,
  CURSO_PADRES_NOMBRE,
} from '@/lib/protocolo'
import WaitlistContactToggle from '@/components/admin/WaitlistContactToggle'

export const metadata = { title: 'Lista de espera' }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Bogota',
  })
}

/** La regla de validación acordada: 20 ventas pagadas en 14 días. */
const META_PREVENTA = 20

export default async function ListaEsperaPage() {
  const rows = await getDigitalWaitlist()

  const quierenCurso = rows.filter((r) => r.wants_course)
  const pendientes = quierenCurso.filter((r) => !r.contacted_at)

  // De dónde llegan las familias. Es lo que dice qué canal vale la pena.
  const porOrigen = new Map<string, number>()
  for (const r of rows) {
    const key = r.source ?? 'sin origen'
    porOrigen.set(key, (porOrigen.get(key) ?? 0) + 1)
  }
  const origenes = [...porOrigen.entries()].sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Lista de espera</h1>
        <p className="text-gray-600">
          Familias que descargaron el protocolo gratis y las que pidieron aviso de «
          {CURSO_PADRES_NOMBRE}». Se venden por WhatsApp, no por Instagram.
        </p>
      </div>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Descargaron la guía</p>
          <p className="text-3xl font-heading font-bold tabular-nums">{rows.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Quieren el curso</p>
          <p className="text-3xl font-heading font-bold text-primary-600 tabular-nums">
            {quierenCurso.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            La preventa se valida con {META_PREVENTA} ventas pagadas, no con inscritos.
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Por escribirles</p>
          <p className="text-3xl font-heading font-bold tabular-nums">{pendientes.length}</p>
          <p className="text-xs text-gray-500 mt-1">Pidieron el curso y nadie les ha escrito.</p>
        </div>
      </section>

      {origenes.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
            De dónde llegan
          </h2>
          <div className="flex flex-wrap gap-2">
            {origenes.map(([origen, total]) => (
              <span
                key={origen}
                className="text-sm px-3 py-1 rounded-full bg-secondary-50 text-secondary-700"
              >
                {origen}: <strong className="tabular-nums">{total}</strong>
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Para medir cada canal, comparta el enlace con su origen:{' '}
            <code>inventiagroup.com/protocolo?origen=instagram</code>
          </p>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="card p-6 text-gray-600">
          Todavía nadie se ha registrado. La página pública es{' '}
          <Link href="/protocolo" className="text-primary-600 font-medium hover:underline">
            /protocolo
          </Link>
          .
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 font-medium text-gray-600">Familia</th>
                <th className="px-4 py-3 font-medium text-gray-600">Edades</th>
                <th className="px-4 py-3 font-medium text-gray-600">Curso</th>
                <th className="px-4 py-3 font-medium text-gray-600">Origen</th>
                <th className="px-4 py-3 font-medium text-gray-600">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.full_name}</p>
                    <a
                      href={`https://wa.me/${r.whatsapp}?text=${encodeURIComponent(
                        buildWaitlistWhatsAppMessage({
                          fullName: r.full_name,
                          wantsCourse: r.wants_course,
                        })
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 font-medium hover:underline"
                    >
                      Escribir por WhatsApp
                    </a>
                    {r.email && <p className="text-xs text-gray-500">{r.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ageBandLabel(r.child_age_band)}</td>
                  <td className="px-4 py-3">
                    {r.wants_course ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
                        Sí
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Solo la guía</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.source ?? '—'}</td>
                  <td className="px-4 py-3">
                    <WaitlistContactToggle id={r.id} contacted={Boolean(r.contacted_at)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
