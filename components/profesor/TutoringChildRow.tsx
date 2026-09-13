'use client'

import { useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import { AI_USE_OPTIONS, SUBJECTS, type AiUse } from '@/lib/homework'

export interface TutoringChildRowProps {
  blockId: string
  childId: string
  childName: string
  planName: string
  initial: {
    present: boolean
    subjects: string[]
    whatWasDone: string | null
    stuckOn: string | null
    aiUse: string
    aiNote: string | null
    homeworkCompleted: boolean | null
  }
}

/**
 * Una fila del listado del monitor: marcar que el niño llegó y dejar la bitácora.
 *
 * El formulario solo se abre cuando el niño está marcado como presente. Con doce
 * niños en la pantalla, mostrar doce formularios abiertos al tiempo vuelve la
 * vista inservible en un celular — que es donde el monitor la va a usar.
 */
export default function TutoringChildRow({
  blockId,
  childId,
  childName,
  planName,
  initial,
}: TutoringChildRowProps) {
  const [present, setPresent] = useState(initial.present)
  const [subjects, setSubjects] = useState<string[]>(initial.subjects)
  const [whatWasDone, setWhatWasDone] = useState(initial.whatWasDone ?? '')
  const [stuckOn, setStuckOn] = useState(initial.stuckOn ?? '')
  const [aiUse, setAiUse] = useState<string>(initial.aiUse)
  const [aiNote, setAiNote] = useState(initial.aiNote ?? '')
  const [homeworkCompleted, setHomeworkCompleted] = useState<boolean | null>(
    initial.homeworkCompleted
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = childName.trim().split(/\s+/)[0]

  const send = async (payload: Record<string, unknown>) => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/admin/tutoring/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId, childId, ...payload }),
    })

    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'No pudimos guardar.')
      return false
    }

    setSaved(true)
    return true
  }

  const togglePresent = async () => {
    const next = !present
    // Se pinta de una vez y se corrige si el servidor rechaza: el monitor está
    // marcando niños de pie, no esperando respuestas de red.
    setPresent(next)

    const ok = next
      ? await send({ present: true, subjects, whatWasDone, stuckOn, aiUse, aiNote, homeworkCompleted })
      : await send({ present: false })

    if (!ok) setPresent(!next)
  }

  const saveDetails = () =>
    send({ present: true, subjects, whatWasDone, stuckOn, aiUse, aiNote, homeworkCompleted })

  const toggleSubject = (id: string) =>
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  return (
    <div className={`rounded-xl border p-4 ${present ? 'border-primary-300 bg-primary-50/40' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={togglePresent}
          disabled={saving}
          className="flex items-center gap-3 text-left disabled:opacity-50"
        >
          <span
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
              present ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300'
            }`}
          >
            {present && <FaCheck size={11} />}
          </span>
          <span>
            <span className="block font-medium">{childName}</span>
            <span className="block text-xs text-gray-500">{planName}</span>
          </span>
        </button>

        {saved && !saving && <span className="text-xs text-primary-600 font-medium">Guardado</span>}
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {present && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              Materias de hoy
            </p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSubject(s.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    subjects.includes(s.id)
                      ? 'bg-secondary-600 border-secondary-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-secondary-400'
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Qué avanzó
              </span>
              <textarea
                value={whatWasDone}
                onChange={(e) => setWhatWasDone(e.target.value)}
                rows={2}
                maxLength={600}
                placeholder={`Terminó el taller de fracciones y repasó para el quiz.`}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-400 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                En qué se atascó
              </span>
              <textarea
                value={stuckOn}
                onChange={(e) => setStuckOn(e.target.value)}
                rows={2}
                maxLength={600}
                placeholder="Déjelo vacío si no se trabó en nada."
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-400 focus:outline-none"
              />
              <span className="text-[11px] text-gray-400">
                Si el mismo tema se repite, el sistema le avisa a la familia.
              </span>
            </label>
          </div>

          {/* Declaración de IA. Obligatoria en la práctica: siempre hay una
              opción marcada, y la que viene por defecto es "no usó". */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              ¿Usó inteligencia artificial?
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {AI_USE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAiUse(option.id as AiUse)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    aiUse === option.id
                      ? option.tone === 'atencion'
                        ? 'border-accent-500 bg-accent-50'
                        : 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-medium">
                    {option.icon} {option.label}
                  </span>
                </button>
              ))}
            </div>

            {aiUse !== 'no' && (
              <input
                type="text"
                value={aiNote}
                onChange={(e) => setAiNote(e.target.value)}
                maxLength={600}
                placeholder="¿Para qué la usó? (lo lee la familia)"
                className="mt-2 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-400 focus:outline-none"
              />
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              {[
                { value: true, label: 'Terminó la tarea' },
                { value: false, label: 'Quedó pendiente' },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() =>
                    setHomeworkCompleted((prev) => (prev === option.value ? null : option.value))
                  }
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                    homeworkCompleted === option.value
                      ? 'bg-gray-800 border-gray-800 text-white'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={saveDetails}
              disabled={saving}
              className="btn btn-primary text-sm py-2 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : `Guardar registro de ${firstName}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
