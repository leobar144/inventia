'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaCheckCircle } from 'react-icons/fa'
import type { MakeupInfo } from '@/lib/supabase/makeup-queries'

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MakeupCard({
  childId,
  childName,
  info,
}: {
  childId: string
  childName: string
  info: MakeupInfo
}) {
  const router = useRouter()
  const [openFor, setOpenFor] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = childName.trim().split(/\s+/)[0]

  // Si no faltó a nada, esta sección no tiene por qué existir en la pantalla.
  if (info.missed.length === 0) return null

  const handleBook = async (missedSessionId: string, makeupSessionId: string) => {
    setSaving(true)
    setError(null)

    const res = await fetch('/api/portal/makeup-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, missedSessionId, makeupSessionId }),
    })

    setSaving(false)
    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setError(body.error || 'No pudimos agendar la reposición.')
      return
    }

    setOpenFor(null)
    router.refresh()
  }

  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold">Clases por recuperar</h2>
      <p className="text-sm text-gray-600 mb-5">
        {firstName} faltó a estas clases. Puedes reponerlas en otro horario del mismo curso, sin
        costo.
      </p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="space-y-3">
        {info.missed.map((missed) => {
          const remaining = info.remainingByCourse[missed.courseId] ?? 0
          const slots = info.slotsByCourse[missed.courseId] ?? []
          const isOpen = openFor === missed.sessionId

          return (
            <div key={missed.sessionId} className="rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <p className="font-medium">
                    {missed.title} · <span className="text-gray-500">{missed.courseTitle}</span>
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    Era el {formatWhen(missed.scheduledAt)}
                  </p>
                </div>

                {missed.bookedInto ? (
                  <span className="text-sm text-primary-700 font-medium flex items-center gap-1.5">
                    <FaCheckCircle size={13} />
                    <span className="capitalize">
                      Repone el {formatWhen(missed.bookedInto.scheduledAt)}
                    </span>
                  </span>
                ) : remaining <= 0 ? (
                  <span className="text-xs text-gray-500">
                    Ya usaste todas las recuperaciones de este plan
                  </span>
                ) : slots.length === 0 ? (
                  <span className="text-xs text-gray-500">
                    No hay horarios con cupo por ahora
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenFor(isOpen ? null : missed.sessionId)}
                    className="btn btn-outline text-sm py-1.5 px-3"
                  >
                    {isOpen ? 'Cancelar' : 'Reponer esta clase'}
                  </button>
                )}
              </div>

              {!missed.bookedInto && (
                <p className="text-xs text-accent-700 mt-1">
                  Te quedan {missed.daysLeft} día{missed.daysLeft === 1 ? '' : 's'} para reponerla
                  {remaining > 0 && ` · ${remaining} recuperación${remaining === 1 ? '' : 'es'} disponible${remaining === 1 ? '' : 's'}`}
                </p>
              )}

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Elige un horario</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.sessionId}
                        type="button"
                        disabled={saving}
                        onClick={() => handleBook(missed.sessionId, slot.sessionId)}
                        className="text-left rounded-lg border border-gray-200 p-3 hover:border-primary-400 transition-colors disabled:opacity-50"
                      >
                        <p className="text-sm font-medium capitalize">
                          {formatWhen(slot.scheduledAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {slot.title} · {slot.modality === 'presencial' ? '📍' : '💻'}{' '}
                          {slot.spotsLeft} cupo{slot.spotsLeft === 1 ? '' : 's'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
