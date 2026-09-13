'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WaitlistContactToggle({
  id,
  contacted,
}: {
  id: string
  contacted: boolean
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const toggle = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/lista-espera', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, contacted: !contacted }),
    })
    setSaving(false)
    if (res.ok) router.refresh()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap disabled:opacity-50 ${
        contacted
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {contacted ? 'Contactada ✓' : 'Marcar contactada'}
    </button>
  )
}
