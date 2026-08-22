import { getAdminMetrics, getCourseOccupancy, getLastCronRun } from '@/lib/supabase/admin-queries'
import { COORDINATOR_MONTHLY_COP, INSTRUCTOR_HOURLY_COP } from '@/lib/economics'

const HEALTH_STYLES = {
  sano: { badge: 'bg-primary-100 text-primary-700', label: '🟢 Sano', bar: 'bg-primary-500' },
  justo: { badge: 'bg-accent-100 text-accent-700', label: '🟡 Justo', bar: 'bg-accent-500' },
  critico: { badge: 'bg-red-100 text-red-700', label: '🔴 Crítico', bar: 'bg-red-500' },
} as const

export default async function AdminMetricsPage() {
  const [metrics, occupancy, cron] = await Promise.all([
    getAdminMetrics(),
    getCourseOccupancy(),
    getLastCronRun(),
  ])

  // Corre una vez al día: si pasaron más de 30 horas, algo dejó de funcionar.
  const cronAtrasado = cron.hoursAgo === null || cron.hoursAgo > 30

  // Margen mensual agregado de todos los grupos, contra el costo fijo.
  const totalMarginPerClass = occupancy.reduce((sum, o) => sum + o.economics.marginPerClass, 0)
  const monthlyMargin = totalMarginPerClass * 4 // 4 clases al mes por grupo
  const coversFixedCost = monthlyMargin >= COORDINATOR_MONTHLY_COP

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Métricas</h1>
        <p className="text-gray-600">Vistazo rápido del negocio.</p>
      </div>

      {(cronAtrasado || !cron.ok) && (
        <div className="card p-4 border-l-4 border-l-red-500 bg-red-50">
          <p className="font-bold text-red-900">
            🔴 Los envíos automáticos no están corriendo
          </p>
          <p className="text-sm text-red-800">
            {cron.ranAt === null
              ? 'La tarea diaria nunca se ha ejecutado. Los recordatorios de clase y el seguimiento post-prueba no están saliendo.'
              : cron.error
                ? `Última corrida con error: ${cron.error}`
                : `La última corrida fue hace ${Math.round(cron.hoursAgo ?? 0)} horas. Debería correr todos los días.`}
          </p>
        </div>
      )}

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
        <div className="flex justify-between items-end mb-1 flex-wrap gap-2">
          <h2 className="text-xl font-bold">Ocupación de grupos</h2>
          <p className="text-sm text-gray-500">
            Instructor: ${INSTRUCTOR_HOURLY_COP.toLocaleString('es-CO')} por hora dictada, sin
            importar cuántos niños haya
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Un grupo a media capacidad puede estar perdiendo plata sin que se note hasta que cierra el
          mes.
        </p>

        <div
          className={`card p-5 mb-4 border-l-4 ${
            coversFixedCost ? 'border-l-primary-500' : 'border-l-accent-500'
          }`}
        >
          <p className="text-sm text-gray-500 mb-1">Margen mensual de todos los grupos</p>
          <p className="text-2xl font-bold">
            ${Math.round(monthlyMargin).toLocaleString('es-CO')} COP
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {coversFixedCost ? (
              <>
                ✅ Cubre el costo fijo de la coordinadora ($
                {COORDINATOR_MONTHLY_COP.toLocaleString('es-CO')}) y sobran $
                {Math.round(monthlyMargin - COORDINATOR_MONTHLY_COP).toLocaleString('es-CO')}.
              </>
            ) : (
              <>
                ⚠️ Faltan $
                {Math.round(COORDINATOR_MONTHLY_COP - monthlyMargin).toLocaleString('es-CO')} para
                cubrir el costo fijo de la coordinadora ($
                {COORDINATOR_MONTHLY_COP.toLocaleString('es-CO')}).
              </>
            )}
          </p>
        </div>

        {occupancy.length === 0 ? (
          <p className="text-gray-600">No hay cursos creados todavía.</p>
        ) : (
          <div className="space-y-3">
            {occupancy.map((row) => {
              const e = row.economics
              const style = HEALTH_STYLES[e.health]
              const fillPercent = Math.min(100, (e.students / e.maxStudents) * 100)

              return (
                <div key={row.courseId} className="card p-5">
                  <div className="flex justify-between items-start gap-4 flex-wrap mb-3">
                    <div>
                      <p className="font-bold">{row.courseTitle}</p>
                      <p className="text-sm text-gray-500">
                        {e.students} de {e.maxStudents} cupos
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className={`${style.bar} h-2 rounded-full transition-all`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>

                  {e.students === 0 ? (
                    <p className="text-sm text-gray-500">
                      Sin alumnos activos. Cada clase que se dicte cuesta $
                      {e.instructorCostIfRun.toLocaleString('es-CO')} y no genera ingreso.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Ingreso por clase</p>
                        <p className="font-medium">
                          ${Math.round(e.revenuePerClass).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Margen por clase</p>
                        <p
                          className={`font-medium ${
                            e.marginPerClass < 0 ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          ${Math.round(e.marginPerClass).toLocaleString('es-CO')} (
                          {Math.round(e.marginPercent)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Para no perder</p>
                        <p className="font-medium">
                          {e.studentsToBreakEven === 0
                            ? '✓ Ya no pierde'
                            : `Faltan ${e.studentsToBreakEven} niño${e.studentsToBreakEven === 1 ? '' : 's'}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

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
