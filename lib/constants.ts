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

// Navigation
// Apuntan a anclas de la home (no páginas propias) hasta que existan /cursos, /acerca-de, /blog reales.
export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/#cursos' },
  { label: 'Por qué INVENTIA', href: '/#caracteristicas' },
  { label: 'Contacto', href: '/#contacto' },
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

// Pricing
// ⚠️ Valores APROXIMADOS de referencia (estimados por sesión, 4 sesiones/mes).
// Ajustar cuando el negocio defina precios definitivos.
export const PRICING_PLANS = [
  {
    id: 'grupal',
    name: 'Grupal',
    groupSize: 'Grupo de 4-6 niños',
    pricePerSession: 30000,
    sessionsPerMonth: 4,
    highlight: false,
    features: [
      'Clases en vivo (60 min c/u)',
      '4 sesiones al mes',
      'Ambiente colaborativo entre compañeros',
      'Material y proyectos incluidos',
    ],
  },
  {
    id: 'semiprivado',
    name: 'Semi-Privado',
    groupSize: 'Grupo de 2-3 niños',
    pricePerSession: 45000,
    sessionsPerMonth: 4,
    highlight: true,
    features: [
      'Clases en vivo (60 min c/u)',
      '4 sesiones al mes',
      'Atención más personalizada',
      'Material y proyectos incluidos',
      'Reprogramación flexible',
    ],
  },
  {
    id: 'individual',
    name: 'Individual',
    groupSize: '1 a 1 con el instructor',
    pricePerSession: 70000,
    sessionsPerMonth: 4,
    highlight: false,
    features: [
      'Clases en vivo (60 min c/u)',
      '4 sesiones al mes',
      '100% personalizado al ritmo de tu hijo',
      'Material y proyectos incluidos',
      'Reprogramación flexible',
    ],
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
