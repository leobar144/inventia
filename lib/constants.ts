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
export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Acerca de', href: '/acerca-de' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
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
export const PRICING = {
  monthly: {
    student: 99000, // COP
    multiple: 180000, // 2+ students
  },
  hourly: {
    student: 25000, // Per class
  },
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
