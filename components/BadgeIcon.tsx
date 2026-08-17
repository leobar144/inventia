import type { BadgeLevel } from '@/lib/badges'

const GRADIENT_BY_COLOR: Record<string, string> = {
  primary: 'from-primary-400 to-primary-600',
  secondary: 'from-secondary-400 to-secondary-600',
  accent: 'from-accent-400 to-accent-600',
}

const SIZE_CLASSES = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-20 h-20 text-4xl',
  lg: 'w-28 h-28 text-5xl',
}

export default function BadgeIcon({
  level,
  size = 'md',
  locked = false,
}: {
  level: BadgeLevel
  size?: keyof typeof SIZE_CLASSES
  locked?: boolean
}) {
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${GRADIENT_BY_COLOR[level.color]} ring-4 ring-white shadow-lg flex items-center justify-center shrink-0 ${SIZE_CLASSES[size]} ${
        locked ? 'grayscale opacity-40' : ''
      }`}
      title={level.name}
    >
      <span>{level.icon}</span>
    </div>
  )
}
