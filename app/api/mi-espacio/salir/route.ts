import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_ESPACIO } from '../entrar/route'

/**
 * Salir del espacio.
 *
 * Es un GET y no un DELETE a propósito: lo usa un niño haciendo clic en un
 * enlace, muchas veces en el computador de la casa que comparte con un hermano.
 */
export async function GET(request: Request) {
  const store = await cookies()
  store.delete(COOKIE_ESPACIO)
  return NextResponse.redirect(new URL('/mi-espacio', request.url))
}
