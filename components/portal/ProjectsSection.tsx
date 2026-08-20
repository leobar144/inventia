'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaExternalLinkAlt, FaTrash, FaPlus } from 'react-icons/fa'
import { createClient } from '@/lib/supabase/client'
import type { ChildProject } from '@/types'

export default function ProjectsSection({
  childId,
  projects,
}: {
  childId: string
  projects: ChildProject[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('child_projects')
      .insert({ child_id: childId, title, url })

    setSaving(false)

    if (insertError) {
      setError('No pudimos guardar el proyecto. Revisa el link e intenta de nuevo.')
      return
    }

    setTitle('')
    setUrl('')
    setOpen(false)
    router.refresh()
  }

  const handleDelete = async (projectId: string) => {
    const supabase = createClient()
    await supabase.from('child_projects').delete().eq('id', projectId)
    router.refresh()
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Sus proyectos</h2>
        {!open && (
          <button onClick={() => setOpen(true)} className="btn btn-outline text-sm py-2">
            <FaPlus className="mr-2" size={11} /> Agregar proyecto
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          {error && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ¿Cómo se llama el proyecto?
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm"
              placeholder="ej. Mi primer videojuego"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Link del proyecto (Scratch, Roblox, etc.)
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field text-sm"
              placeholder="https://scratch.mit.edu/projects/..."
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn btn-primary text-sm py-2">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-outline text-sm py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no hay proyectos guardados. Cuando su hijo/a termine algo en Scratch, Roblox u
          otra herramienta, agrega el link aquí para tenerlo siempre a la mano.
        </p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-4 py-2.5"
            >
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary-700 hover:underline flex items-center gap-2 min-w-0"
              >
                <span className="truncate">{project.title}</span>
                <FaExternalLinkAlt size={10} className="shrink-0" />
              </a>
              <button
                onClick={() => handleDelete(project.id)}
                aria-label="Eliminar proyecto"
                className="text-gray-400 hover:text-red-600 shrink-0"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
