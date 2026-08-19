'use client'

import { useState } from 'react'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'

export default function CourseCurriculumSelect({
  courseId,
  currentLevelId,
}: {
  courseId: string
  currentLevelId: string | null
}) {
  const [value, setValue] = useState(currentLevelId ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = async (newValue: string) => {
    setValue(newValue)
    setSaved(false)
    setSaving(true)

    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curriculumLevelId: newValue || null }),
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
        <option value="">Sin nivel del currículo</option>
        {CURRICULUM_LEVELS.map((level) => (
          <option key={level.id} value={level.id}>
            {level.name} ({level.ageRange})
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-primary-600">✓ Guardado</span>}
    </div>
  )
}
