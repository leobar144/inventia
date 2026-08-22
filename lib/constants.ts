// Site Configuration
export const SITE_CONFIG = {
  name: 'INVENTIA',
  description: 'Robótica, Programación e IA para niños | Tu hijo no usa tecnología. La inventa.',
  url: 'https://inventiagroup.com',
  ogImage: 'https://inventiagroup.com/og-image.png',
  links: {
    instagram: 'https://instagram.com/inventia',
    whatsapp: 'https://wa.me/3502114492',
    email: 'info@inventiagroup.com',
  },
  contact: {
    email: 'info@inventiagroup.com',
    whatsapp: '3502114492',
    phone: '+57 350 211 4492',
  },
}

/**
 * Campaña vigente (campamento, promoción de temporada, etc.).
 *
 * Antes la fecha "5-12 de octubre" estaba escrita a mano en cinco lugares
 * distintos: el badge del hero, el popup, las preguntas frecuentes y dos
 * llamados a la acción. El 13 de octubre toda la web habría quedado anunciando
 * algo vencido — y una web con fechas viejas destruye la credibilidad más
 * rápido que cualquier otra cosa.
 *
 * Ahora vive aquí. Para cambiar de campaña se editan estas líneas; cuando pasa
 * `endDate` los avisos desaparecen solos, sin tocar código.
 */
export const CAMPAIGN = {
  enabled: true,
  name: 'Campamento STEM',
  dateLabel: '5-12 de octubre',
  /** Último día en que la campaña sigue anunciándose (hora de Bogotá). */
  endDate: '2026-10-12',
  whatsappMessage: '¡Hola INVENTIA! Quiero reservar un cupo para el campamento.',
} as const

/** Si la campaña sigue vigente hoy. Colombia es UTC-5 todo el año. */
export function isCampaignActive(now: Date = new Date()): boolean {
  if (!CAMPAIGN.enabled) return false
  return now.getTime() <= new Date(`${CAMPAIGN.endDate}T23:59:59-05:00`).getTime()
}

// Navigation
export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Por qué INVENTIA', href: '/acerca-de' },
  { label: 'Jardines y colegios', href: '/instituciones' },
  { label: 'Contacto', href: '/#contacto' },
]

// Programas — contenido compartido entre la sección "Cursos" de la home y /cursos
export const PROGRAM_TRACKS = [
  {
    id: 'exploradores',
    icon: '🧸',
    title: 'Exploradores',
    description:
      'Robótica sin pantallas para los más pequeños. Programan robots de piso con tarjetas físicas.',
    bullets: ['Edades 4-6 años', 'Clases de 1 hora', 'Grupos de máximo 6 niños'],
    borderColor: 'border-accent-500',
    iconColor: 'text-accent-500',
  },
  {
    id: 'scratch',
    icon: '🎨',
    title: 'Scratch & Bloques',
    description: 'Aprende lógica de programación con bloques visuales. Perfecto para empezar.',
    bullets: ['Edades 7-10 años', '8 sesiones semanales', 'Proyecto final: Tu primer juego'],
    borderColor: 'border-primary-500',
    iconColor: 'text-primary-500',
  },
  {
    id: 'python',
    icon: '🐍',
    title: 'Python & Código Real',
    description: 'Domina un lenguaje de programación real usado por profesionales.',
    bullets: ['Edades 10-16 años', 'Clases en vivo vía Google Meet', 'Certificado verificable'],
    borderColor: 'border-secondary-500',
    iconColor: 'text-secondary-500',
  },
  {
    id: 'robotica',
    icon: '🤖',
    title: 'Robótica',
    description: 'Construye y programa robots reales. Aprende electrónica y mecánica.',
    bullets: ['Edades 8-14 años', 'Robots de la academia', 'Competencias inter-grupo'],
    borderColor: 'border-accent-500',
    iconColor: 'text-accent-500',
  },
  {
    id: 'ia',
    icon: '🧠',
    title: 'IA & Futuro',
    description: 'Entiende inteligencia artificial, machine learning y el futuro de la tecnología.',
    bullets: ['Edades 12-16 años', 'Proyectos con TensorFlow', 'Portfolio profesional'],
    borderColor: 'border-purple-500',
    iconColor: 'text-purple-500',
  },
]

// Course Levels
export const COURSE_LEVELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

// User Roles
export const USER_ROLES = {
  student: 'Estudiante',
  parent: 'Padre/Madre',
  instructor: 'Instructor',
  admin: 'Administrador',
}

// Planes — grupos de máximo 8 niños, presenciales o virtuales.
// OJO: el campo `price` de cada plan es solo el precio de referencia que muestra
// la home. El precio que se cobra de verdad vive en la tabla course_plan_prices,
// porque depende de la combinación curso × plan (ver lib/plans.ts).
export const PRICING_PLANS = [
  {
    id: 'mes',
    name: 'Mes',
    levelName: 'Explorador INVENTIA',
    levelIcon: '🧭',
    tagline: 'Ideal para empezar sin compromiso',
    description:
      'Perfecto para que tu hijo conozca el método INVENTIA y pierda el miedo a crear con tecnología, sin atarte a un pago largo.',
    unlocks: 'Insignia digital de bienvenida + su primer mini-proyecto terminado',
    classes: 4,
    price: 290000,
    originalPrice: null as number | null,
    highlight: false,
  },
  {
    id: 'trimestre',
    name: 'Trimestre',
    levelName: 'Constructor INVENTIA',
    levelIcon: '🔧',
    tagline: 'El plan más elegido',
    description:
      'El tiempo justo para que tu hijo termine su primer proyecto real de principio a fin y gane confianza de verdad, no solo teoría.',
    unlocks: 'Certificado firmado por su instructor al cerrar su primer proyecto real',
    classes: 12,
    price: 765000,
    originalPrice: 870000 as number | null,
    highlight: true,
  },
  {
    id: 'semestre',
    name: 'Semestre',
    levelName: 'Inventor(a) INVENTIA',
    levelIcon: '🚀',
    tagline: 'Máximo compromiso, máximos resultados',
    description:
      'El plan de quienes van en serio: tu hijo construye su portafolio de proyectos y domina las bases de un lenguaje o de robótica, con el mejor precio por clase de todos los planes.',
    unlocks: 'Certificado mayor + portafolio de 4 proyectos publicable en su perfil',
    classes: 24,
    price: 1390000,
    originalPrice: 1740000 as number | null,
    highlight: false,
  },
]
export const PRICING = {
  currency: 'COP',
}

// Features
export const FEATURES = [
  {
    title: 'Robótica',
    description: 'Construye y programa robots reales',
    icon: '🤖',
  },
  {
    title: 'Programación',
    description: 'Aprende código desde Scratch hasta Python',
    icon: '💻',
  },
  {
    title: 'IA & Machine Learning',
    description: 'Entiende el futuro con inteligencia artificial',
    icon: '🧠',
  },
  {
    title: 'Instructores Expertos',
    description: 'Aprende de profesionales de la tecnología',
    icon: '👨‍🏫',
  },
  {
    title: 'Proyectos Reales',
    description: 'Crea y termina proyectos funcionales',
    icon: '🎯',
  },
  {
    title: 'Certificados',
    description: 'Obtén certificados verificables',
    icon: '🏆',
  },
]

// Age Groups
export const AGE_GROUPS = [
  { id: '4-6', label: '4-6 años', description: 'Introducción a la lógica' },
  { id: '7-9', label: '7-9 años', description: 'Bloques visuales (Scratch)' },
  { id: '10-12', label: '10-12 años', description: 'Programación e inicio de robótica' },
  { id: '13-16', label: '13-16 años', description: 'Código avanzado y proyectos complejos' },
]
