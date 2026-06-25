import Link from 'next/link'
import type { Quest, QuestStatus } from '@/types/database'

interface QuestCardProps {
  quest: Quest
  status?: QuestStatus
  score?: number
  xpEarned?: number
}

const TYPE_EMOJI: Record<string, string> = {
  quiz:      '📝',
  lab:       '🔬',
  read:      '📖',
  mini_game: '🎮',
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'text-teal-400 bg-teal-400/10 border-teal-500/20',
  medium: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
  hard:   'text-red-400 bg-red-400/10 border-red-500/20',
}

const STATUS_RING: Record<string, string> = {
  locked:    'opacity-50 grayscale',
  active:    '',
  completed: 'ring-2 ring-teal-500/40',
  failed:    'ring-2 ring-red-500/30',
}

export default function QuestCard({ quest, status = 'locked', score, xpEarned }: QuestCardProps) {
  const isLocked = status === 'locked'

  return (
    <Link
      // PENTING: path quest detail sebenarnya ada di /murid/quests/[id],
      // bukan /quests/[id] — ini yang menyebabkan 404 sebelumnya
      href={isLocked ? '#' : `/murid/quests/${quest.id}`}
      className={`block bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-4 hover:border-slate-600/70 transition-all ${STATUS_RING[status]} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center text-xl">
          {TYPE_EMOJI[quest.type]}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLE[quest.difficulty]}`}>
            {quest.difficulty}
          </span>
          {status === 'completed' && <span className="text-teal-400 text-lg">✓</span>}
          {status === 'locked'    && <span className="text-slate-600 text-lg">🔒</span>}
        </div>
      </div>

      {/* Title & description */}
      <h3 className="font-semibold text-white text-sm mb-1 leading-tight">{quest.title}</h3>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{quest.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-xs">⭐</span>
          <span className="text-xs font-medium text-yellow-400">
            {status === 'completed' ? `+${xpEarned ?? quest.xp_reward}` : quest.xp_reward} XP
          </span>
        </div>
        <span className="text-xs text-slate-500">~{quest.estimated_minutes}min</span>
      </div>

      {/* Score bar if completed */}
      {status === 'completed' && score !== undefined && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Score</span>
            <span className={`font-medium ${score >= 80 ? 'text-teal-400' : score >= 60 ? 'text-orange-400' : 'text-red-400'}`}>
              {score}%
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full">
            <div
              className={`h-1 rounded-full ${score >= 80 ? 'bg-teal-400' : score >= 60 ? 'bg-orange-400' : 'bg-red-400'}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
