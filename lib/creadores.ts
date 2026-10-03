/**
 * Creadores con IA — intensivo virtual del receso de diciembre de 2026.
 *
 * POR QUÉ EXISTE
 *
 * La Sala de Tareas vende urgencia (el boletín) y deja la hora en ~$11.700. Es
 * el producto de caja, pero necesita 5 niños para no perder plata y no se puede
 * mostrar: lo que pasa en una tarde de tareas es privado.
 *
 * Este intensivo es lo contrario y por eso convive con ella:
 *   - Empata con 2 niños (el instructor cuesta $640.000 por las 8 horas, no por
 *     niño), así que se puede abrir sin tener lista.
 *   - Se puede mostrar: el niño termina con un proyecto publicado que la familia
 *     comparte, y eso es lo que trae a la siguiente familia.
 *   - Se vende a quien ya está: arranca el 1 de diciembre, cuatro días después
 *     de que el refuerzo termina el 27 de noviembre.
 *
 * El temario NO es nuevo: son los módulos de IA del currículo real de INVENTIA
 * (ver lib/curriculum.ts — «Descubro la Inteligencia Artificial» del nivel
 * Innovadores, «AI Lab» y «Tech Startup» del nivel Lab), comprimidos en cuatro
 * mañanas. Es la razón por la que se puede dictar en diciembre sin inventar
 * contenido.
 *
 * REFERENCIA DE MERCADO (verificada el 3/10/2026): InnovaKids vende en Colombia
 * 10 clases de IA en vivo uno a uno para 8–17 años por USD 297 (~$1.245.000
 * COP), o sea ~$124.500 la hora. Aquí son 8 horas en vivo por $390.000
 * (~$48.750 la hora) en grupo de máximo 8. Superprof promedia $26.425 la hora
 * de clase particular de refuerzo, sin proyecto ni certificado.
 */

export const CREADORES_CON_IA = {
  /** Apágalo cuando el taller termine y la página saldrá del aire sola. */
  enabled: true,

  name: 'Creadores con IA',
  slug: '/creadores-con-ia',

  ageRange: '8 a 14 años',
  modality: 'En línea, en vivo',

  /** Martes 1 a viernes 4 de diciembre de 2026. */
  datesLabel: 'Del martes 1 al viernes 4 de diciembre',
  datesShort: '1 al 4 de diciembre',
  timeLabel: '9:00 a 11:00 a.m.',
  sessions: 4,
  hoursPerSession: 2,

  /** Mismo cupo que un curso regular: el instructor alcanza a acompañar a 8. */
  capacity: 8,

  priceCOP: 390_000,
  /**
   * Precio para quien ya está adentro: familias de la Sala de Tareas, de un
   * curso activo, o que venían del campamento que se canceló. No es generosidad
   * — su costo de adquisición ya se pagó.
   */
  familyPriceCOP: 320_000,

  /**
   * Se reserva con un abono y el saldo se paga antes de empezar. Es la forma de
   * cerrar ventas en noviembre sin que la familia desembolse todo de una vez.
   */
  depositCOP: 100_000,
  balanceDeadlineLabel: '28 de noviembre',

  /**
   * Último día para inscribirse. Después de esta fecha la página deja de
   * vender sola, sin que haya que acordarse de bajarla.
   */
  closesOn: '2026-11-28',

  whatsappMessage: '¡Hola INVENTIA! Quiero información de Creadores con IA (1 al 4 de diciembre).',
} as const

/** Total de horas en vivo. */
export const CREADORES_TOTAL_HOURS = CREADORES_CON_IA.sessions * CREADORES_CON_IA.hoursPerSession

/**
 * ¿Todavía se puede vender?
 *
 * Colombia es UTC-5 todo el año, así que basta correr la hora y comparar las
 * fechas como texto (YYYY-MM-DD ordena igual que el calendario).
 */
export function isCreadoresOpen(now: Date = new Date()): boolean {
  if (!CREADORES_CON_IA.enabled) return false
  const bogota = new Date(now.getTime() - 5 * 60 * 60 * 1000)
  return bogota.toISOString().slice(0, 10) <= CREADORES_CON_IA.closesOn
}

export interface CreadoresDay {
  day: number
  dateLabel: string
  title: string
  /** Lo que el niño hace ese día, no lo que el profesor explica. */
  does: string
  /** Módulo del currículo de INVENTIA del que sale. */
  from: string
}

export const CREADORES_DAYS: readonly CreadoresDay[] = [
  {
    day: 1,
    dateLabel: 'Martes 1',
    title: 'Cómo piensa una inteligencia artificial',
    does: 'Entrena un modelo para que reconozca algo que él escoge —su mascota, un gesto, un sonido— y descubre por qué se equivoca cuando los datos están mal. Deja de ser magia.',
    from: 'Descubro la Inteligencia Artificial · nivel Innovadores',
  },
  {
    day: 2,
    dateLabel: 'Miércoles 2',
    title: 'Crear con IA sin hacer trampa',
    does: 'Aprende a escribir instrucciones precisas para generar imagen, texto y voz, y a declarar cómo usó la IA en cada paso. Es el protocolo que los colegios ya están empezando a exigir.',
    from: 'AI Lab · nivel Lab',
  },
  {
    day: 3,
    dateLabel: 'Jueves 3',
    title: 'Mi proyecto',
    does: 'Escoge un problema de su casa, su colegio o su barrio y construye una solución con lo aprendido. Nadie se lo asigna: lo elige él, que es lo que hace que lo termine.',
    from: 'Innovators Challenge · nivel Innovadores',
  },
  {
    day: 4,
    dateLabel: 'Viernes 4',
    title: 'Lo presenta y queda publicado',
    does: 'Presenta su proyecto en dos minutos a los demás niños y a su familia. Queda publicado en su perfil de INVENTIA, con certificado y con el registro de cómo usó la IA.',
    from: 'Tech Startup · nivel Lab',
  },
] as const

export const CREADORES_INCLUDES: readonly string[] = [
  'Cuatro mañanas en vivo con instructor, no videos grabados.',
  'Grupo de máximo 8 niños: a cada uno le alcanza el turno de preguntar.',
  'Su proyecto publicado en su perfil de INVENTIA, con enlace para compartir.',
  'Certificado digital a nombre del niño.',
  'El registro de cómo usó la inteligencia artificial en cada paso del proyecto.',
  'Las herramientas que se usan son gratuitas: solo hace falta un computador con internet.',
] as const

export interface CreadoresFaq {
  q: string
  a: string
}

export const CREADORES_FAQ: readonly CreadoresFaq[] = [
  {
    q: '¿Mi hijo necesita saber programar?',
    a: 'No. Arranca desde cero. Si ya programa, el proyecto del jueves le queda más ambicioso, pero nadie se queda atrás por no haber visto código antes.',
  },
  {
    q: '¿Qué necesita en la casa?',
    a: 'Un computador con internet y audífonos. Todas las herramientas que usamos son gratuitas: no hay que comprar programas ni pagar suscripciones. Desde celular no se puede trabajar bien.',
  },
  {
    q: '¿No es mejor un curso uno a uno?',
    a: 'Para esto, no. La mitad del aprendizaje está en ver qué construyeron los otros siete y en tener que explicar lo propio. Por eso el grupo es de 8 y no de 20: alcanza para discutir y sigue siendo pequeño.',
  },
  {
    q: '¿Y si no puede entrar un día?',
    a: 'La sesión queda grabada y se la enviamos, pero el proyecto se construye en vivo. Si sabe que va a faltar dos de los cuatro días, le recomendamos esperar al siguiente taller en vez de pagar este.',
  },
  {
    q: '¿Cómo se paga?',
    a: `Se reserva el cupo con $${CREADORES_CON_IA.depositCOP.toLocaleString('es-CO')} por transferencia o Nequi y el saldo se paga antes del ${CREADORES_CON_IA.balanceDeadlineLabel}. Los datos se los enviamos por WhatsApp.`,
  },
  {
    q: '¿Van a publicar fotos de mi hijo?',
    a: 'Solo si usted firma la autorización de imagen, y es aparte de la inscripción. Lo que sí queda publicado es el proyecto: eso lo hizo él y es suyo. Si prefiere que su perfil sea privado, también se puede.',
  },
] as const
