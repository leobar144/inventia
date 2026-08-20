/**
 * Verificación de contraseñas filtradas, contra la API pública de
 * HaveIBeenPwned (más de 800 millones de contraseñas de filtraciones reales).
 *
 * Supabase ofrece esto mismo, pero solo en plan Pro. La fuente es pública y
 * gratuita, así que se implementa aquí.
 *
 * Método de k-anonimato: se envían únicamente los primeros 5 caracteres del
 * hash SHA-1. El servidor responde con todos los sufijos que empiezan igual
 * (~800) y la comparación final se hace localmente. La contraseña nunca sale
 * del dispositivo, ni completa ni como hash completo — el prefijo de 5
 * caracteres no identifica nada.
 *
 * Limitación conocida: al correr en el navegador, alguien decidido puede
 * saltárselo. No importa para lo que protege: el riesgo real es un papá que
 * reutiliza sin saber una contraseña ya filtrada, no un atacante poniéndose a
 * sí mismo una clave débil.
 */

async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * Cuántas veces apareció esta contraseña en filtraciones conocidas.
 * Devuelve 0 si está limpia — o si no se pudo consultar.
 *
 * Ante un fallo de red se devuelve 0 a propósito (fail open): que HIBP esté
 * caído no puede impedirle a una familia crear su cuenta.
 */
export async function getPwnedCount(password: string): Promise<number> {
  if (!password) return 0

  try {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
    if (!res.ok) return 0

    const body = await res.text()

    for (const line of body.split('\n')) {
      const [lineSuffix, count] = line.trim().split(':')
      if (lineSuffix === suffix) return Number(count) || 0
    }

    return 0
  } catch {
    return 0
  }
}

/** Mensaje para el usuario, o null si la contraseña está limpia. */
export async function checkPasswordBreached(password: string): Promise<string | null> {
  const count = await getPwnedCount(password)
  if (count === 0) return null

  return `Esta contraseña apareció en ${count.toLocaleString('es-CO')} filtración${
    count === 1 ? '' : 'es'
  } de datos conocida${count === 1 ? '' : 's'}. Elige otra para proteger la cuenta de tu hijo/a.`
}
