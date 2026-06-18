'use client'
import Link from 'next/link'
import type { StudentProfile } from '@/types/database'

interface HeaderProps {
  profile: StudentProfile | null
}

export default function Header({ profile }: HeaderProps) {
  return (
    <header className="fixed top-0 left-[240px] right-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 z-30">
      {/* Logo */}
      <div className="flex-1">
        <span className="text-xl font-bold text-blue-600">QuestChem</span>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-orange-500">
          <span>🔥</span>
          <span>{profile?.streak_days ?? 0}</span>
        </div>

        {/* Leaderboard */}
        <Link
          href="/achievements"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
        >
          🏆
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
        >
          👤
        </Link>
      </div>
    </header>
  )
}
