'use client'
import { getLevelProgress } from '@/types/database'

interface XpBarProps {
  xp: number
  level: number
  xpToNextLevel: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function XpBar({ xp, level, xpToNextLevel, showLabel = true, size = 'md' }: XpBarProps) {
  const progress = getLevelProgress(xp, level)
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Lvl {level}</span>
          <span className="text-xs text-blue-600 font-medium">
            {xp.toLocaleString()} / {(xp + xpToNextLevel).toLocaleString()} XP
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} bg-gradient-to-r from-blue-500 to-blue-600 rounded-full xp-bar-fill`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
