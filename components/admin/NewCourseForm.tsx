'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { COURSE_LEVELS } from '@/lib/constants'
import { CURRICULUM_LEVELS } from '@/lib/curriculum'
import type { InstructorOption } from '@/lib/supabase/admin-queries'

export default function NewCourseForm({ instructors }: { instructors: InstructorOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('beginner')
  const [price, setPrice] = useState('')
  const [schedule, setSchedule] = useState('')
  const [maxStudents, setMaxStudents] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [curriculumLevelId, setCurriculumLevelId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        level,
        price: Number(price),
        currency: 'COP',
        schedule,
        maxStudents: maxStudents ? Number(maxStudents) : null,
        instructorId: instructorId || null,
        curriculumLevelId: curriculumLevelId || null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('No pudimos crear el curso. Intenta de nuevo.')
      return
    }

    setTitle('')
    setDescription('')
    setPrice('')
    setSchedule('')
    setMaxStudents('')
    setInstructorId('')
    setCurriculumLevelId('')
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        + Nuevo curso
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-bold">Nuevo curso</h2>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="ej. Scratch & Bloques — Lunes 4pm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
            {Object.entries(COURSE_LEVELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          rows={2}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio (COP)</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
          <input
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="input-field"
            placeholder="Lun-Mié 4:00 PM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cupos máx.</label>
          <input
            type="number"
            value={maxStudents}
            onChange={(e) => setMaxStudents(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="input-field"
          >
            <option value="">Sin asignar</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.full_name} ({instructor.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel del Método CREA
          </label>
          <select
            value={curriculumLevelId}
            onChange={(e) => setCurriculumLevelId(e.target.value)}
            className="input-field"
          >
            <option value="">Sin nivel del currículo</option>
            {CURRICULUM_LEVELS.map((cLevel) => (
              <option key={cLevel.id} value={cLevel.id}>
                {cLevel.name} ({cLevel.ageRange})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Creando...' : 'Crear curso'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
          Cancelar
        </button>
      </div>
    </form>
  )
}
