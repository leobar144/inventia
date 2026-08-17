import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/portal')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-heading font-bold">INVENTIA · Administración</span>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/admin/reservas" className="text-secondary-200 hover:text-white">
              Reservas
            </Link>
            <Link href="/admin/asistencia" className="text-secondary-200 hover:text-white">
              Asistencia
            </Link>
            <Link href="/portal" className="text-secondary-200 hover:text-white">
              Portal de Padres
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
