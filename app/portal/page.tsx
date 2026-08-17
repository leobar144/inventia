import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getChildrenForParent } from '@/lib/supabase/portal-queries'
import { FaPlus, FaChild } from 'react-icons/fa'

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

export default async function PortalHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const children = user ? await getChildrenForParent(user.id) : []

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Mis hijos</h1>
          <p className="text-gray-600">Gestiona los perfiles y el progreso de tus hijos.</p>
        </div>
        <Link href="/portal/hijos/nuevo" className="btn btn-primary">
          <FaPlus className="mr-2" /> Agregar hijo/a
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="card p-12 text-center">
          <FaChild className="text-5xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Aún no has agregado a ningún hijo</h2>
          <p className="text-gray-600 mb-6">
            Agrega el perfil de tu hijo/a para poder inscribirlo en un curso.
          </p>
          <Link href="/portal/hijos/nuevo" className="btn btn-primary">
            Agregar hijo/a
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/portal/hijos/${child.id}`}
              className="card-hover p-6 block"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {child.full_name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold">{child.full_name}</h3>
              <p className="text-gray-600 text-sm">{calculateAge(child.birth_date)} años</p>
              <p className="text-primary-600 text-sm font-medium mt-3">Ver progreso →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
