import { getSchoolLeads, getTeamMembers } from '@/lib/supabase/admin-queries'
import {
  CURRENT_STUDENT_CAPACITY,
  MAX_CONCURRENT_GROUPS,
  MAX_STUDENTS_PER_GROUP,
} from '@/lib/economics'
import { leadStatusLabel, leadStatusClass } from '@/lib/leads'
import SchoolLeadActions from '@/components/admin/SchoolLeadActions'

export default async function AdminInstitucionesPage() {
  const [leads, team] = await Promise.all([getSchoolLeads(), getTeamMembers()])
  const pending = leads.filter((l) => l.status === 'nuevo').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Jardines y colegios</h1>
        <p className="text-gray-600">
          Solicitudes de demostración del canal institucional.
        </p>
      </div>

      {pending > 0 && (
        <div className="card p-4 border-l-4 border-l-accent-500 bg-accent-50">
          <p className="font-bold text-accent-900">
            ⚡ {pending} solicitud{pending === 1 ? '' : 'es'} sin responder
          </p>
          <p className="text-sm text-accent-800">
            En venta institucional el primero que contesta suele quedarse con el negocio.
          </p>
        </div>
      )}

      <div className="card p-5 border-l-4 border-l-secondary-500">
        <p className="text-sm text-gray-500 mb-1">Capacidad actual</p>
        <p className="text-xl font-bold">
          {CURRENT_STUDENT_CAPACITY} estudiantes al tiempo
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {MAX_CONCURRENT_GROUPS} grupos simultáneos × {MAX_STUDENTS_PER_GROUP} niños. Si una
          institución pide más, hay que contratar antes de comprometerse — o arrancar por etapas.
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="text-gray-600">
          Todavía no hay solicitudes. La página está en{' '}
          <a href="/instituciones" className="text-primary-600 hover:underline">
            /instituciones
          </a>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const exceedsCapacity =
              lead.studentCount != null && lead.studentCount > CURRENT_STUDENT_CAPACITY

            return (
              <div key={lead.id} className="card p-5">
                <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
                  <div>
                    <p className="font-bold text-lg">{lead.institutionName}</p>
                    <p className="text-sm text-gray-600">
                      {lead.contactName}
                      {lead.contactRole && ` · ${lead.contactRole}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${leadStatusClass(lead.status)}`}
                    >
                      {leadStatusLabel(lead.status)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(lead.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    {lead.assignedToName && (
                      <p className="text-xs text-gray-500">→ {lead.assignedToName}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {lead.studentCount != null && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        exceedsCapacity
                          ? 'bg-accent-100 text-accent-800'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {lead.studentCount} estudiantes
                      {exceedsCapacity && ' · supera tu capacidad'}
                    </span>
                  )}
                  {lead.grades && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {lead.grades}
                    </span>
                  )}
                </div>

                {exceedsCapacity && lead.studentCount != null && (
                  <p className="text-sm text-accent-800 bg-accent-50 rounded-lg p-3 mb-3">
                    ⚠️ Piden {lead.studentCount} y hoy puedes atender {CURRENT_STUDENT_CAPACITY}.
                    Ofrece arrancar con{' '}
                    {Math.floor(CURRENT_STUDENT_CAPACITY / MAX_STUDENTS_PER_GROUP)} grupos y crecer
                    por etapas, en vez de prometer todo de una.
                  </p>
                )}

                {lead.message && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">
                    {lead.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">{lead.phone}</span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-gray-600 hover:text-primary-600"
                  >
                    {lead.email}
                  </a>
                </div>

                <SchoolLeadActions
                  leadId={lead.id}
                  contactName={lead.contactName}
                  institutionName={lead.institutionName}
                  phone={lead.phone}
                  status={lead.status}
                  assignedTo={lead.assignedTo}
                  team={team}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
