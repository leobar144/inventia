'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa'
import { LEAD_STATUSES, buildLeadWhatsAppMessage } from '@/lib/leads'
import type { InstructorOption } from '@/lib/supabase/admin-queries'

export default function SchoolLeadActions({
  leadId,
  contactName,
  institutionName,
  phone,
  status: initialStatus,
  assignedTo: initialAssignedTo,
  team,
}: {
  leadId: string
  contactName: string
  institutionName: string
  phone: string
  status: string
  assignedTo: string | null
  team: InstructorOption[]
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (updates: { status?: string; assignedTo?: string | null }) => {
    setSaving(true)
    setError(null)

    const res = await fetch('/api/admin/school-leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, ...updates }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('No pudimos guardar el cambio.')
      return
    }

    router.refresh()
  }

  const whatsappUrl = `https://wa.me/57${phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    buildLeadWhatsAppMessage({ contactName, institutionName })
  )}`

  const handleRespond = () => {
    // Al abrir WhatsApp se marca como contactado: si no, la etapa se queda
    // desactualizada justo cuando sí se hizo la gestión.
    if (status === 'nuevo') {
      setStatus('contactado')
      save({ status: 'contactado' })
    }
  }

  return (
    <div className="border-t border-gray-100 mt-3 pt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleRespond}
          className="btn btn-primary text-sm py-2"
        >
          <FaWhatsapp className="mr-2" /> Responder por WhatsApp
        </a>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Etapa</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              save({ status: e.target.value })
            }}
            disabled={saving}
            className="input-field text-sm py-1.5 w-auto"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Responsable</label>
          <select
            value={assignedTo}
            onChange={(e) => {
              setAssignedTo(e.target.value)
              save({ assignedTo: e.target.value || null })
            }}
            disabled={saving}
            className="input-field text-sm py-1.5 w-auto"
          >
            <option value="">Sin asignar</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}
