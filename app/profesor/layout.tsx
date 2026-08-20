import { redirect } from 'next/navigation'
import { createClient, getCachedUser } from '@/lib/supabase/server'
import ProfesorNav from '@/components/profesor/ProfesorNav'

export default async function ProfesorLayout({ children }: { children: React.ReactNode }) {
  const {
    data: { user },
  } = await getCachedUser()

  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'instructor' && profile?.role !== 'admin') redirect('/portal')

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfesorNav instructorName={profile.full_name?.split(' ')[0] || 'Profesor'} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
