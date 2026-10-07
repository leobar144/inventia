import { randomInt } from 'crypto'

/**
 * El espacio del niño.
 *
 * Todo el portal está escrito para el acudiente. Esto es lo contrario: la
 * única pantalla de INVENTIA donde el que manda es el niño. Por eso aquí no
 * aparecen precios, pagos, correos, apellidos ni la palabra "su hijo".
 *
 * Entra con un código que le pasa su papá (o que el instructor le dicta en la
 * clase de prueba). No tiene cuenta ni contraseña a propósito: ver
 * supabase/migrations/041_espacio_del_nino.sql.
 */

/**
 * Nombre de la cookie donde viaja el código.
 *
 * Vive aquí y no junto a la ruta que la escribe porque un `route.ts` de Next
 * SOLO puede exportar métodos HTTP: cualquier otra exportación rompe el build
 * ("is not a valid Route export field"), y `tsc --noEmit` no lo detecta.
 */
export const COOKIE_ESPACIO = 'inventia_espacio'

/**
 * Alfabeto del código.
 *
 * Sin O, 0, I, 1 ni L: son las que un niño de ocho años confunde al copiar del
 * tablero o al oírlas dictadas. Un código que no se puede dictar en voz alta no
 * sirve, porque así es como se entrega en la clase de prueba.
 */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Largo del código. 31^6 ≈ 887 millones de combinaciones. */
const LARGO = 6

/**
 * Genera un código nuevo.
 *
 * Usa randomInt del módulo crypto y no Math.random: no es una contraseña, pero
 * un generador predecible convertiría "adivinar el código del vecino" en algo
 * trivial.
 */
export function generateAccessCode(): string {
  let codigo = ''
  for (let i = 0; i < LARGO; i++) {
    codigo += ALFABETO[randomInt(ALFABETO.length)]
  }
  return codigo
}

/**
 * Normaliza lo que el niño escribió.
 *
 * Va a escribirlo en minúsculas, con espacios, o con guion en la mitad porque
 * así lo vio escrito. Nada de eso debería ser un error.
 */
export function normalizeAccessCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** ¿Tiene forma de código? Se valida antes de ir a la base. */
export function looksLikeAccessCode(input: string): boolean {
  const limpio = normalizeAccessCode(input)
  if (limpio.length !== LARGO) return false
  return [...limpio].every((c) => ALFABETO.includes(c))
}

// ---------------------------------------------------------------------------
// La primera misión
//
// Son los 15 minutos de la clase de prueba, vistos desde el lado del niño. No
// es un formulario de inscripción disfrazado: al final el niño tiene su
// espacio abierto, dijo qué quiere crear y se llevó algo hecho.

export type PasoId = 'entrar' | 'sueno' | 'reto'

export interface PasoMision {
  id: PasoId
  /** Lo que el niño lee. En segunda persona y en presente. */
  titulo: string
  ayuda: string
  /** Se marca solo, sin que el niño haga nada. */
  automatico?: boolean
}

export const MISION_BIENVENIDA: readonly PasoMision[] = [
  {
    id: 'entrar',
    titulo: 'Entraste a tu espacio',
    ayuda: 'Este lugar es tuyo. Aquí va a quedar todo lo que construyas.',
    automatico: true,
  },
  {
    id: 'sueno',
    titulo: 'Dinos qué quieres crear',
    ayuda: 'No hay respuesta mala. Sirve para saber por dónde empezar contigo.',
  },
  {
    id: 'reto',
    titulo: 'Termina tu primer reto',
    ayuda: 'Lo haces con tu profe en la clase. Cuando te salga, márcalo aquí.',
  },
] as const

/** Lo que el niño puede escoger. Opciones cerradas: nunca texto libre. */
export interface Sueno {
  id: string
  emoji: string
  label: string
  /** Curso de INVENTIA al que apunta. Lo usa el instructor, no se le muestra al niño. */
  rutaSugerida: string
}

export const SUENOS: readonly Sueno[] = [
  { id: 'videojuego', emoji: '🎮', label: 'Un videojuego', rutaSugerida: 'Scratch & Bloques' },
  { id: 'robot', emoji: '🤖', label: 'Un robot que se mueva', rutaSugerida: 'Robótica' },
  { id: 'app', emoji: '📱', label: 'Una aplicación', rutaSugerida: 'Python & Código Real' },
  { id: 'mundo3d', emoji: '🌍', label: 'Un mundo en 3D', rutaSugerida: 'Robótica' },
  { id: 'dibujo', emoji: '🎨', label: 'Dibujos y animaciones', rutaSugerida: 'Scratch & Bloques' },
  { id: 'ia', emoji: '🧠', label: 'Algo con inteligencia artificial', rutaSugerida: 'IA & Futuro' },
] as const

export function getSueno(id: string | null): Sueno | null {
  if (!id) return null
  return SUENOS.find((s) => s.id === id) ?? null
}

/**
 * Lee los pasos guardados, tolerando basura.
 *
 * La columna es jsonb y la escribe el servidor, pero si algún día llega otra
 * cosa el espacio del niño no puede romperse por eso.
 */
export function parseSteps(value: unknown): PasoId[] {
  if (!Array.isArray(value)) return []
  const validos = MISION_BIENVENIDA.map((p) => p.id)
  return value.filter((v): v is PasoId => typeof v === 'string' && validos.includes(v as PasoId))
}

export function misionCompleta(steps: PasoId[]): boolean {
  return MISION_BIENVENIDA.every((p) => steps.includes(p.id))
}

// ---------------------------------------------------------------------------
// Qué sigue
//
// La pantalla responde UNA pregunta: "¿qué hago ahora?". Un niño que abre su
// espacio y ve seis tarjetas no hace ninguna.

export interface MisionSiguiente {
  /** Encabezado corto. */
  titulo: string
  /** Una frase. Nada de párrafos. */
  detalle: string
  emoji: string
  /** A dónde lo lleva, si hay a dónde. */
  href?: string
  hrefLabel?: string
}

export interface DatosDelEspacio {
  nombre: string
  pasos: PasoId[]
  /** Próxima clase ya agendada, si tiene. */
  proximaClase: { titulo: string; cuando: string; enlace: string | null } | null
  /** Clases que lleva completadas. Alimenta la insignia. */
  clasesCompletadas: number
  /** Cuántas le faltan para la siguiente insignia. */
  clasesParaSiguienteInsignia: number | null
  siguienteInsignia: string | null
  proyectos: number
}

/**
 * Decide la única cosa que el niño debería hacer ahora.
 *
 * El orden importa: primero terminar la misión de bienvenida, después la clase
 * que tiene encima, y solo cuando no hay nada urgente, el progreso.
 */
export function calcularMisionSiguiente(datos: DatosDelEspacio): MisionSiguiente {
  const pendiente = MISION_BIENVENIDA.find((p) => !datos.pasos.includes(p.id))

  if (pendiente && pendiente.id === 'sueno') {
    return {
      titulo: 'Cuéntanos qué quieres crear',
      detalle: 'Escoge una. Después puedes cambiarla.',
      emoji: '✨',
    }
  }

  if (pendiente && pendiente.id === 'reto') {
    return {
      titulo: 'Termina tu primer reto',
      detalle: 'Cuando te salga, márcalo abajo y desbloqueas tu primera insignia.',
      emoji: '🎯',
    }
  }

  if (datos.proximaClase) {
    return {
      titulo: `Tu clase: ${datos.proximaClase.titulo}`,
      detalle: datos.proximaClase.cuando,
      emoji: '📅',
      href: datos.proximaClase.enlace ?? undefined,
      hrefLabel: datos.proximaClase.enlace ? 'Entrar a la clase' : undefined,
    }
  }

  if (datos.proyectos === 0) {
    return {
      titulo: 'Sube tu primer proyecto',
      detalle: 'Lo que construyas queda publicado con tu nombre.',
      emoji: '🚀',
    }
  }

  if (datos.clasesParaSiguienteInsignia && datos.siguienteInsignia) {
    const faltan = datos.clasesParaSiguienteInsignia
    return {
      titulo: `Te ${faltan === 1 ? 'falta 1 clase' : `faltan ${faltan} clases`}`,
      detalle: `Para ser ${datos.siguienteInsignia}.`,
      emoji: '🏅',
    }
  }

  return {
    titulo: '¡Vas completo!',
    detalle: 'No tienes nada pendiente. Nos vemos en la próxima clase.',
    emoji: '🎉',
  }
}

/** Solo el nombre de pila: el espacio del niño nunca muestra apellidos. */
export function primerNombre(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}
