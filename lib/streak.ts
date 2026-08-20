import type { SessionPathState } from '@/lib/supabase/portal-queries'

/**
 * Racha de asistencia: cuántas clases seguidas (ya ocurridas) asistió sin
 * faltar, contando hacia atrás desde la más reciente. Se corta en la
 * primera clase pasada que no tenga asistencia registrada.
 */
export function computeAttendanceStreak(sessions: SessionPathState[]): number {
  const now = new Date()
  const pastSessions = sessions.filter((s) => new Date(s.scheduledAt) <= now)

  let streak = 0
  for (let i = pastSessions.length - 1; i >= 0; i--) {
    if (pastSessions[i].state === 'done') streak++
    else break
  }
  return streak
}
