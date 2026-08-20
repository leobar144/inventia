'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ClassNoteEntry } from '@/lib/supabase/portal-queries'

export default function ClassDiary({
  childId,
  childName,
  entries,
  photoConsent: initialPhotoConsent,
}: {
  childId: string
  childName: string
  entries: ClassNoteEntry[]
  photoConsent: boolean
}) {
  const router = useRouter()
  const [photoConsent, setPhotoConsent] = useState(initialPhotoConsent)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstName = childName.trim().split(/\s+/)[0]

  const handleToggle = async () => {
    const next = !photoConsent
    setSaving(true)
    setError(null)

    const res = await fetch('/api/portal/photo-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, photoConsent: next }),
    })

    setSaving(false)

    if (!res.ok) {
      setError('No pudimos guardar el cambio.')
      return
    }

    setPhotoConsent(next)
    router.refresh()
  }

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-xl font-bold">Su bitácora de clases</h2>
          <p className="text-sm text-gray-600">
            Lo que {firstName} construyó en cada clase, contado por su profesor.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-4 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Permitir fotos en clase</p>
            <p className="text-xs text-gray-600 max-w-md mt-0.5">
              Autorizas a INVENTIA a tomar y guardar fotos de {firstName} durante la clase. Solo
              las ves tú, en este portal. <strong>No se publican</strong> ni aparecen en el enlace
              que compartes.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={photoConsent}
            aria-label="Permitir fotos en clase"
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              photoConsent ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                photoConsent ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-600">
          Todavía no hay registros. Después de su próxima clase, aquí vas a ver qué hizo.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <article key={entry.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              {entry.photoUrl && (
                <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={entry.photoUrl}
                    alt={`Proyecto de ${firstName}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {entry.sessionTitle} · {entry.courseTitle}
                  {entry.scheduledAt && (
                    <>
                      {' · '}
                      {new Date(entry.scheduledAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </>
                  )}
                </p>
                {entry.note ? (
                  <p className="text-sm text-gray-800 mt-1">{entry.note}</p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1 italic">Sin nota</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
