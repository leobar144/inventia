'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FaSignOutAlt } from 'react-icons/fa'

export default function PortalNav({ parentName }: { parentName: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/portal" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <span className="font-heading font-bold text-lg text-secondary-800 hidden sm:inline">
              Portal de Padres
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link href="/portal" className="text-gray-600 hover:text-primary-600 font-medium">
              Mis hijos
            </Link>
            <Link
              href="/portal/pagos"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              Pagos
            </Link>
            <span className="hidden md:inline text-sm text-gray-500">Hola, {parentName}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 font-medium"
              aria-label="Cerrar sesión"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
