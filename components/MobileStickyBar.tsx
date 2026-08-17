import Link from 'next/link'

export default function MobileStickyBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-3">
      <Link
        href="/clase-de-prueba"
        className="btn btn-primary w-full bg-accent-500 hover:bg-accent-600 text-base"
      >
        📅 Reservar Clase de Prueba Gratis
      </Link>
    </div>
  )
}
