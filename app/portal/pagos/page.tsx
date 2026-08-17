import { createClient } from '@/lib/supabase/server'
import { getPaymentsForParent } from '@/lib/supabase/portal-queries'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Aprobado', className: 'bg-primary-100 text-primary-700' },
  DECLINED: { label: 'Rechazado', className: 'bg-red-100 text-red-700' },
  VOIDED: { label: 'Anulado', className: 'bg-gray-100 text-gray-600' },
  ERROR: { label: 'Error', className: 'bg-red-100 text-red-700' },
}

export default async function PagosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payments = user ? await getPaymentsForParent(user.id) : []

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Historial de pagos</h1>

      {payments.length === 0 ? (
        <p className="text-gray-600">Todavía no tienes pagos registrados.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Referencia</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Monto</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const status = STATUS_LABELS[payment.status]
                return (
                  <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-sm font-mono">{payment.reference}</td>
                    <td className="px-4 py-3 text-sm">
                      ${(payment.amount_in_cents / 100).toLocaleString('es-CO')} {payment.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
