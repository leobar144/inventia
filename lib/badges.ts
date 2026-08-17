export interface BadgeLevel {
  id: 'explorador' | 'constructor' | 'inventor' | 'maestro'
  name: string
  icon: string
  threshold: number
  color: string // clase de color tailwind (primary/secondary/accent/purple)
}

// De mayor a menor umbral — se recorre en ese orden para hallar la insignia actual
export const BADGE_LEVELS: BadgeLevel[] = [
  { id: 'maestro', name: 'Maestro Inventor', icon: '🏆', threshold: 48, color: 'accent' },
  { id: 'inventor', name: 'Inventor(a) INVENTIA', icon: '🚀', threshold: 24, color: 'secondary' },
  { id: 'constructor', name: 'Constructor INVENTIA', icon: '🔧', threshold: 12, color: 'primary' },
  { id: 'explorador', name: 'Explorador INVENTIA', icon: '🧭', threshold: 4, color: 'primary' },
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
