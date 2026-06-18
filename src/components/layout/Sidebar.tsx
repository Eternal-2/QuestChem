'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StudentProfile, User } from '@/types/database'
import { getLevelProgress } from '@/types/database'

interface SidebarProps {
  user: User
  profile: StudentProfile | null
}

const NAV_ITEMS = [
  { href: '/home',        label: 'Home',        emoji: '🏠' },
  { href: '/world-map',   label: 'World Map',   emoji: '🗺️' },
  { href: '/virtual-lab', label: 'Virtual Lab', emoji: '🔬' },
  { href: '/quests',      label: 'Quests',      emoji: '📜' },
  { href: '/ai-tutor',    label: 'AI Tutor',    emoji: '🤖' },
]

export default function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0
  const progress = profile ? getLevelProgress(xp, level) : 0

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-gray-100 flex flex-col z-40">
      {/* User info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{user.display_name ?? user.username}</div>
            <div className="text-xs text-gray-400">{profile?.title ?? 'Novice Chemist'}</div>
          </div>
        </div>
        {/* XP bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Level {level}</span>
            <span>{xp.toLocaleString()} XP</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full xp-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Start Mission button */}
      <div className="p-4">
        <Link
          href="/quests"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          ▶ Start Mission
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
