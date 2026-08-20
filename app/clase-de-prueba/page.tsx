'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaArrowRight, FaSpinner } from 'react-icons/fa'
import type { AvailableSlotDay } from '@/types'

const COURSES = [
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

const TOTAL_STEPS = 5

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

  const [days, setDays] = useState<AvailableSlotDay[] | null>(null)
  const [loadingDays, setLoadingDays] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ availabilityId: string; time: string } | null>(
    null
  )

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (step !== 4 || days !== null) return
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
    if (step === 2) return courseInterest !== ''
    if (step === 3)
      return parentName.trim() !== '' && whatsapp.trim() !== '' && parentEmail.trim() !== ''
    if (step === 4) return selectedSlot !== null
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
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">¿Qué curso le interesa?</h2>
              <div className="grid grid-cols-2 gap-3">
                {COURSES.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setCourseInterest(course.id)}
                    className={`card-hover p-4 text-center ${
                      courseInterest === course.id ? 'border-primary-500 ring-2 ring-primary-200' : ''
                    }`}
                  >
                    <div className="text-3xl mb-2">{course.icon}</div>
                    <p className="text-sm font-medium">{course.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
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
          {step === 4 && (
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
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Confirma tu reserva</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Niño/a:</strong> {childName}, {childAge} años</p>
                <p><strong>Curso:</strong> {COURSES.find((c) => c.id === courseInterest)?.label}</p>
                <p><strong>Contacto:</strong> {parentName} · {whatsapp} · {parentEmail}</p>
                <p className="capitalize">
                  <strong>Horario:</strong> {selectedDateLabel} ·{' '}
                  {selectedSlot && formatTimeLabel(selectedSlot.time)}
                </p>
              </div>
              {submitError && (
                <p className="text-red-600 text-sm">{submitError}</p>
              )}
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
                disabled={submitting}
                className="btn btn-primary"
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
