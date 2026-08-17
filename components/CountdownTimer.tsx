'use client'

import { useEffect, useState } from 'react'

function getTimeParts(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  }
}

export default function CountdownTimer({ target }: { target: Date }) {
  const [parts, setParts] = useState(() => getTimeParts(target))

  useEffect(() => {
    const interval = setInterval(() => setParts(getTimeParts(target)), 1000)
    return () => clearInterval(interval)
  }, [target])

  if (parts.done) {
    return <p className="text-primary-600 font-bold text-lg">¡Es hora de tu clase! 🎉</p>
  }

  const units = [
    { label: 'Días', value: parts.days },
    { label: 'Horas', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Seg', value: parts.seconds },
  ]

  return (
    <div className="flex justify-center gap-4">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="text-3xl font-bold text-primary-600 tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 uppercase">{unit.label}</div>
        </div>
      ))}
    </div>
  )
}
