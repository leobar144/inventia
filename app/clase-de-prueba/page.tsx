'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaArrowRight, FaSpinner } from 'react-icons/fa'
import { CONSENT_VERSION } from '@/lib/legal'
import type { AvailableSlotDay } from '@/types'

const COURSES = [
  { id: 'exploradores', label: 'Exploradores (4-6 años)', icon: '🧸' },
  { id: 'scratch', label: 'Scratch & Bloques', icon: '🎨' },
  { id: 'python', label: 'Python & Código Real', icon: '🐍' },
  { id: 'robotica', label: 'Robótica', icon: '🤖' },
  { id: 'ia', label: 'IA & Futuro', icon: '🧠' },
  { id: 'no_seguro', label: 'No estoy seguro todavía', icon: '🤔' },
]

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatDateLabel(dateStr: string): { weekday: string; day: string; month: string } {
  const date = new Date(`${dateStr}T00:00:00`)
  return {
    weekday: WEEKDAY_LABELS[date.getDay()],
    day: String(date.getDate()),
    month: date.toLocaleDateString('es-CO', { month: 'short' }),
  }
}

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// Antes eran 5 pasos para agendar algo GRATIS. Cada paso pierde gente, y dos de
// esos pasos no aportaban: el curso muchos papás no lo saben todavía (ahora es
// opcional y va junto a los datos del niño), y el último solo repetía lo que ya
// habían escrito (ahora el resumen va junto a la elección de horario).
const TOTAL_STEPS = 3

export default function ClaseDePruebaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [courseInterest, setCourseInterest] = useState('')
  const [parentName, setParentName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [referredByCode, setReferredByCode] = useState('')
  const [dataConsent, setDataConsent] = useState(false)

  const [days, setDays] = useState<AvailableSlotDay[] | null>(null)
  const [loadingDays, setLoadingDays] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ availabilityId: string; time: string } | null>(
    null
  )

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (step !== 3 || days !== null) return
    setLoadingDays(true)
    fetch('/api/trial-bookings')
      .then((res) => res.json())
      .then((data) => {
        setDays(data.days || [])
        if (data.days?.length > 0) setSelectedDate(data.days[0].date)
      })
      .finally(() => setLoadingDays(false))
  }, [step, days])

  const canProceed = () => {
    if (step === 1) return childName.trim() !== '' && childAge.trim() !== ''
    if (step === 2)
      return parentName.trim() !== '' && whatsapp.trim() !== '' && parentEmail.trim() !== ''
    return true
  }

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedDate) return
    setSubmitting(true)
    setSubmitError(null)

    const res = await fetch('/api/trial-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availabilityId: selectedSlot.availabilityId,
        bookingDate: selectedDate,
        childName,
        childAge: Number(childAge),
        courseInterest,
        parentName,
        whatsapp,
        parentEmail,
        referredByCode: referredByCode || undefined,
        dataConsent,
        dataConsentVersion: CONSENT_VERSION,
      }),
    })

    if (!res.ok) {
      setSubmitting(false)
      const body = await res.json().catch(() => ({}))
      setSubmitError(body.error || 'No pudimos guardar tu reserva. Intenta de nuevo.')
      if (res.status === 409) {
        setDays(null)
        setSelectedSlot(null)
      }
      return
    }

    const { bookingId } = await res.json()
    router.push(`/clase-de-prueba/confirmacion/${bookingId}`)
  }

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Paso {step} de {TOTAL_STEPS}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Cuéntanos de tu hijo/a</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  className="input-field"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input
                  type="number"
                  min={4}
                  max={16}
                  className="input-field"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                />
              </div>

              {/* El curso es OPCIONAL y vive aquí. Como paso propio y obligatorio
                  frenaba a los padres que todavía no saben qué le conviene a su
                  hijo — que son la mayoría de los que llegan de un anuncio. */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Ya sabes qué le interesa? <span className="text-gray-400">(opcional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COURSES.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() =>
                        setCourseInterest(courseInterest === course.id ? '' : course.id)
                      }
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition-colors ${
                        courseInterest === course.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {course.icon} {course.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Si no estás seguro, no importa — en la clase de prueba lo definimos contigo.
                </p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Tus datos de contacto</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu nombre (papá/mamá)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="300 123 4567"
                  className="input-field"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="input-field"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Te enviamos ahí la confirmación con el link de la clase.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Alguien te recomendó INVENTIA? (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Código de referido"
                  className="input-field"
                  value={referredByCode}
                  onChange={(e) => setReferredByCode(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Elige fecha y hora</h2>

              {loadingDays && (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-3xl text-primary-500 mx-auto" />
                </div>
              )}

              {!loadingDays && days !== null && days.length === 0 && (
                <p className="text-gray-600">
                  No hay horarios disponibles por ahora. Escríbenos por WhatsApp y te ayudamos a
                  encontrar un espacio.
                </p>
              )}

              {!loadingDays && days !== null && days.length > 0 && (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {days.map((day) => {
                      const label = formatDateLabel(day.date)
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day.date)
                            setSelectedSlot(null)
                          }}
                          className={`shrink-0 px-4 py-2 rounded-lg border text-center ${
                            selectedDate === day.date
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          <p className="text-xs uppercase">{label.weekday}</p>
                          <p className="font-bold">{label.day}</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {days
                      .find((d) => d.date === selectedDate)
                      ?.slots.map((slot) => (
                        <button
                          key={slot.availabilityId}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-lg border text-sm ${
                            selectedSlot?.availabilityId === slot.availabilityId
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          {formatTimeLabel(slot.time)}
                        </button>
                      ))}
                  </div>
                </>
              )}

              {/* El resumen y la autorización viven aquí, no en un paso aparte:
                  el paso extra solo repetía lo que el padre acababa de escribir. */}
              {selectedSlot && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm mt-6">
                  <p className="first-letter:uppercase">
                    <strong>{childName}</strong>, {childAge} años · {selectedDateLabel} a las{' '}
                    {formatTimeLabel(selectedSlot.time)}
                  </p>
                  <p className="text-gray-600">
                    Te confirmamos a {parentEmail} y por WhatsApp al {whatsapp}.
                  </p>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={dataConsent}
                  onChange={(e) => setDataConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 leading-snug">
                  Soy el padre, madre o representante legal de {childName || 'el menor'} y autorizo a
                  INVENTIA el tratamiento de nuestros datos personales conforme a la{' '}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Política de Tratamiento de Datos
                  </Link>
                  .
                </span>
              </label>

              {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn btn-outline disabled:opacity-0"
            >
              <FaArrowLeft className="mr-2" /> Atrás
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="btn btn-primary disabled:opacity-40"
              >
                Siguiente <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !dataConsent || !selectedSlot}
                className="btn btn-primary disabled:opacity-40"
              >
                {submitting ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
