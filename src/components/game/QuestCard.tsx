import Link from 'next/link'
import type { Quest, QuestStatus } from '@/types/database'
import { DIFFICULTY_COLORS } from '@/types/database'

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

const STATUS_STYLES: Record<string, string> = {
  locked:    'opacity-50 grayscale',
  active:    '',
  completed: 'ring-2 ring-green-400',
  failed:    'ring-2 ring-red-300',
}

export default function QuestCard({ quest, status = 'locked', score, xpEarned }: QuestCardProps) {
  const isLocked = status === 'locked'

  return (
    <Link
      href={isLocked ? '#' : `/quests/${quest.id}`}
      className={`block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all ${STATUS_STYLES[status]} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
          {TYPE_EMOJI[quest.type]}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[quest.difficulty]}`}>
            {quest.difficulty}
          </span>
          {status === 'completed' && <span className="text-green-500 text-lg">✓</span>}
          {status === 'locked'    && <span className="text-gray-300 text-lg">🔒</span>}
        </div>
      </div>

      {/* Title & description */}
      <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{quest.title}</h3>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{quest.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-xs">⭐</span>
          <span className="text-xs font-medium text-gray-600">
            {status === 'completed' ? `+${xpEarned ?? quest.xp_reward}` : quest.xp_reward} XP
          </span>
        </div>
        <span className="text-xs text-gray-400">~{quest.estimated_minutes}min</span>
      </div>

      {/* Score bar if completed */}
      {status === 'completed' && score !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Score</span>
            <span className={`font-medium ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
              {score}%
            </span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full">
            <div
              className={`h-1 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
