import {
  getAllChildrenWithParent,
  getAllCoursesWithInstructor,
  getRecentManualPayments,
} from '@/lib/supabase/admin-queries'
import { PAYMENT_METHODS } from '@/lib/payments'
import ManualPaymentForm from '@/components/admin/ManualPaymentForm'

const METHOD_LABELS = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m.label]))

export default async function AdminPagosPage() {
  const [students, courses, recentPayments] = await Promise.all([
    getAllChildrenWithParent(),
    getAllCoursesWithInstructor(),
    getRecentManualPayments(),
  ])

  const totalRegistered = recentPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Pagos en efectivo</h1>
        <p className="text-gray-600">
          Registra pagos recibidos por fuera de la plataforma — efectivo, transferencia, Nequi o
          datáfono. La inscripción queda activa igual que con un pago en línea.
        </p>
      </div>

      <ManualPaymentForm students={students} courses={courses} />

      <section>
        <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold">Últimos pagos registrados</h2>
          {recentPayments.length > 0 && (
            <p className="text-sm text-gray-500">
              Suma de los mostrados:{' '}
              <strong className="text-gray-900">${totalRegistered.toLocaleString('es-CO')}</strong>
            </p>
          )}
        </div>

        {recentPayments.length === 0 ? (
          <p className="text-gray-600">Todavía no has registrado ningún pago manual.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Niño/a</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Curso</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Medio</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Registró</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Nota</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.child_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.course_title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {METHOD_LABELS[p.method] ?? p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">${p.amount.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-3 text-gray-600">{p.recorded_by_name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
