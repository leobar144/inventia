'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FaSignOutAlt } from 'react-icons/fa'

export default function ProfesorNav({ instructorName }: { instructorName: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-secondary-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <span className="font-heading font-bold">INVENTIA · Profesores</span>
        <nav className="flex items-center space-x-6 text-sm">
          <Link href="/profesor" className="text-secondary-200 hover:text-white">
            Mis Clases
          </Link>
          <Link href="/profesor/curriculo" className="text-secondary-200 hover:text-white">
            Currículo
          </Link>
          <span className="hidden md:inline text-secondary-300">Hola, {instructorName}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-secondary-200 hover:text-white"
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
