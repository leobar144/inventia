/**
 * Quién está detrás de INVENTIA.
 *
 * Existe por una razón concreta: la clase de prueba la dicta el director, y un
 * papá decide agendarla por la persona, no por la academia. Kodland —el
 * competidor grande— pone a cada tutor con foto, estudios y voz propia; esa es
 * la pieza que nos faltaba.
 *
 * REGLA: aquí solo va gente real, con foto real y autorización suya. En agosto
 * la base tenía siete "profesores" que eran alias de prueba, y una de ellos
 * ("Monica") llegó a quedar anotada como profesora real sin serlo. Nadie entra
 * a esta lista sin que el usuario lo confirme por su nombre.
 */

export interface MiembroEquipo {
  id: string
  nombre: string
  rol: string
  foto: string
  /** Texto alternativo de la foto. */
  fotoAlt: string
  /** En primera persona: es él hablándole al papá, no la academia. */
  bio: string
  /** Una línea, para firmas de correo y espacios cortos. */
  unaLinea: string
}

export const LEONARDO: MiembroEquipo = {
  id: 'leonardo-barajas',
  nombre: 'Leonardo Barajas Gordillo',
  rol: 'Ingeniero · Director de INVENTIA',
  foto: '/equipo/leonardo-barajas.jpg',
  fotoAlt: 'Leonardo Barajas Gordillo, ingeniero y director de INVENTIA',
  bio: 'Soy ingeniero, desarrollo software y trabajo con inteligencia artificial todos los días — la misma que su hijo ya está usando para hacer las tareas. Monté INVENTIA porque la diferencia no va a estar entre los niños que usan la IA y los que no: va a estar entre los que la entienden y los que solo le obedecen. La clase de prueba la doy yo, y en esos 15 minutos quiero ver qué le mueve a su hijo.',
  unaLinea: 'Ingeniero, desarrollador y especialista en inteligencia artificial. Director de INVENTIA.',
}

export const EQUIPO: readonly MiembroEquipo[] = [LEONARDO] as const
