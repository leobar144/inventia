'use client'

import { useState } from 'react'
import type { InstructorOption } from '@/lib/supabase/admin-queries'

export default function CourseInstructorSelect({
  courseId,
  currentInstructorId,
  instructors,
}: {
  courseId: string
  currentInstructorId: string | null
  instructors: InstructorOption[]
}) {
  const [value, setValue] = useState(currentInstructorId ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = async (newValue: string) => {
    setValue(newValue)
    setSaved(false)
    setSaving(true)

    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructorId: newValue || null }),
    })

    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="input-field py-1.5 text-sm"
        disabled={saving}
      >
        <option value="">Sin asignar</option>
        {instructors.map((instructor) => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.full_name} ({instructor.email})
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-primary-600">✓ Guardado</span>}
    </div>
  )
}
