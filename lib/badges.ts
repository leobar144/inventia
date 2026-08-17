export interface BadgeLevel {
  id: 'explorador' | 'constructor' | 'inventor' | 'maestro'
  name: string
  icon: string
  threshold: number
  color: string // clase de color tailwind (primary/secondary/accent/purple)
  unlocks: string
}

// De mayor a menor umbral — se recorre en ese orden para hallar la insignia actual
export const BADGE_LEVELS: BadgeLevel[] = [
  {
    id: 'maestro',
    name: 'Maestro Inventor',
    icon: '🏆',
    threshold: 48,
    color: 'accent',
    unlocks: 'Acceso a mentoría de estudiantes nuevos y competencias INVENTIA',
  },
  {
    id: 'inventor',
    name: 'Inventor(a) INVENTIA',
    icon: '🚀',
    threshold: 24,
    color: 'secondary',
    unlocks: 'Certificado mayor + portafolio de 4 proyectos publicable en su perfil',
  },
  {
    id: 'constructor',
    name: 'Constructor INVENTIA',
    icon: '🔧',
    threshold: 12,
    color: 'primary',
    unlocks: 'Certificado firmado por su instructor al cerrar su primer proyecto real',
  },
  {
    id: 'explorador',
    name: 'Explorador INVENTIA',
    icon: '🧭',
    threshold: 4,
    color: 'primary',
    unlocks: 'Insignia digital de bienvenida + su primer mini-proyecto terminado',
  },
]

export interface BadgeProgress {
  classesCompleted: number
  current: BadgeLevel | null
  next: BadgeLevel | null
  classesUntilNext: number | null
}

export function getBadgeProgress(classesCompleted: number): BadgeProgress {
  const current = BADGE_LEVELS.find((level) => classesCompleted >= level.threshold) ?? null

  const next = [...BADGE_LEVELS]
    .reverse()
    .find((level) => classesCompleted < level.threshold) ?? null

  return {
    classesCompleted,
    current,
    next,
    classesUntilNext: next ? next.threshold - classesCompleted : null,
  }
}
