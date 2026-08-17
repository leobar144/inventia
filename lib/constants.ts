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

// Pricing — Clases personalizadas (en casa o virtuales), precios reales del negocio
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
    price: 340000,
    originalPrice: null as number | null,
    includesKit: false,
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
    price: 890000,
    originalPrice: 1020000 as number | null,
    includesKit: false,
    highlight: true,
  },
  {
    id: 'semestre',
    name: 'Semestre',
    levelName: 'Inventor(a) INVENTIA',
    levelIcon: '🚀',
    tagline: 'Máximo compromiso, máximos resultados',
    description:
      'El plan de quienes van en serio: tu hijo construye su portafolio de proyectos y domina las bases de un lenguaje o de robótica, con el kit incluido sin costo extra.',
    unlocks: 'Certificado mayor + portafolio de 4 proyectos publicable en su perfil',
    classes: 24,
    price: 1860000,
    originalPrice: 2040000 as number | null,
    includesKit: true,
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
