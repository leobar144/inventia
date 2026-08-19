import { FaCheck, FaLock, FaPlay } from 'react-icons/fa'
import type { SessionPathState } from '@/lib/supabase/portal-queries'

export default function ClassPath({ sessions }: { sessions: SessionPathState[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        El profesor todavía no ha programado clases para este curso.
      </p>
    )
  }

  return (
    <div className="flex items-start overflow-x-auto pb-2">
      {sessions.map((session, i) => (
        <div key={session.id} className="flex items-center shrink-0">
          <div className="flex flex-col items-center gap-1.5 w-16">
            <div
              className={`rounded-full flex items-center justify-center shrink-0 ${
                session.state === 'next'
                  ? 'w-10 h-10 bg-primary-500 ring-4 ring-primary-100'
                  : session.state === 'done'
                    ? 'w-9 h-9 bg-primary-500'
                    : 'w-9 h-9 bg-white border border-gray-200'
              }`}
              title={session.title}
            >
              {session.state === 'done' && <FaCheck className="text-white" size={14} />}
              {session.state === 'next' && <FaPlay className="text-white" size={13} />}
              {session.state === 'locked' && <FaLock className="text-gray-300" size={12} />}
            </div>
            <span
              className={`text-[11px] text-center leading-tight ${
                session.state === 'locked' ? 'text-gray-400' : 'text-gray-600 font-medium'
              }`}
            >
              Clase {i + 1}
            </span>
          </div>
          {i < sessions.length - 1 && (
            <div
              className={`h-0.5 w-6 mb-5 shrink-0 ${
                session.state === 'done' ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
