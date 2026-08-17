import Link from 'next/link'
import { FaEnvelopeOpenText } from 'react-icons/fa'

export default function RevisaTuCorreoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <FaEnvelopeOpenText className="text-5xl text-primary-500 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold mb-2">Revisa tu correo</h1>
        <p className="text-gray-600 mb-6">
          Te enviamos un enlace de confirmación. Ábrelo desde tu correo (revisa también spam)
          para activar tu cuenta.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Ya confirmé, iniciar sesión
        </Link>
      </div>
    </div>
  )
}
