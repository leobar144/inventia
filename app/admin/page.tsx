import { getAdminMetrics } from '@/lib/supabase/admin-queries'

export default async function AdminMetricsPage() {
  const metrics = await getAdminMetrics()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Métricas</h1>
        <p className="text-gray-600">Vistazo rápido del negocio.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Ingresos este mes</p>
          <p className="text-2xl font-bold text-primary-600">
            ${metrics.revenueThisMonth.toLocaleString('es-CO')} COP
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Ingresos totales</p>
          <p className="text-2xl font-bold">${metrics.revenueAllTime.toLocaleString('es-CO')} COP</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Niños activos</p>
          <p className="text-2xl font-bold">{metrics.activeChildrenCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Niños registrados</p>
          <p className="text-2xl font-bold">{metrics.totalChildrenCount}</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Por renovar pronto</h2>
        {metrics.renewalCandidates.length === 0 ? (
          <p className="text-gray-600">Nadie está por terminar su plan en este momento.</p>
        ) : (
          <div className="space-y-2">
            {metrics.renewalCandidates.map((c, i) => (
              <div
                key={i}
                className="card p-4 flex items-center justify-between flex-wrap gap-2"
              >
                <div>
                  <p className="font-medium">{c.childName}</p>
                  <p className="text-sm text-gray-500">
                    {c.courseTitle} · {c.parentEmail}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent-100 text-accent-700">
                  Le quedan {c.classesRemaining} clase{c.classesRemaining !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
