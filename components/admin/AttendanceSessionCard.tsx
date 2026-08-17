'use client'

import { useState } from 'react'
import type { SessionAttendanceRow } from '@/lib/supabase/admin-queries'

export default function AttendanceSessionCard({ session }: { session: SessionAttendanceRow }) {
  const [checked, setChecked] = useState<Set<string>>(
    new Set(session.children.filter((c) => c.alreadyMarked).map((c) => c.childId))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (childId: string) => {
    setSaved(false)
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(childId)) next.delete(childId)
      else next.add(childId)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, childIds: Array.from(checked) }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold">{session.sessionTitle}</p>
          <p className="text-sm text-gray-500">{session.courseTitle}</p>
        </div>
        <p className="text-sm text-gray-500">
          {new Date(session.scheduledAt).toLocaleString('es-CO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      {session.children.length === 0 ? (
        <p className="text-sm text-gray-500">Nadie inscrito activo en este curso.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {session.children.map((child) => (
            <label
              key={child.childId}
              className="flex items-center space-x-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked.has(child.childId)}
                onChange={() => toggle(child.childId)}
                className="w-auto"
              />
              <span>{child.childName}</span>
            </label>
          ))}
        </div>
      )}

      {session.children.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary text-sm py-2"
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar asistencia'}
        </button>
      )}
    </div>
  )
}
