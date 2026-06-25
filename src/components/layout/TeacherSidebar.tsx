'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  username: string
  display_name: string | null
  role: string
  avatar_url: string | null
}

interface TeacherSidebarProps {
  user: User
}

const NAV_ITEMS = [
  { href: '/guru/home',        label: 'Overview',     emoji: '📊' },
  { href: '/guru/kelas',       label: 'Kelas',        emoji: '🏰' },
  { href: '/guru/roster',      label: 'Roster Siswa', emoji: '👥' },
  { href: '/guru/quest-bank',  label: 'Quest Bank',   emoji: '📜' },
  { href: '/guru/lab-reports', label: 'Lab Reports',  emoji: '🔬' },
]

export default function TeacherSidebar({ user }: TeacherSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login-guru')
    router.refresh()
  }

  const displayName = user.display_name ?? user.username

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[#0d1117] border-r border-slate-800/80 flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400">
            QuestChem
          </span>
          <span className="text-[9px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
            GURU
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-[0_0_16px_rgba(168,85,247,0.25)]">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm truncate">{displayName}</div>
            <div className="text-xs text-purple-400">Pengajar</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                active
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-white shadow-[inset_0_0_12px_rgba(168,85,247,0.05)]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-transparent'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <Link
          href="/guru/kelas/baru"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          + Buat Kelas Baru
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-xs text-slate-600 hover:text-slate-400 py-1.5 transition-colors"
        >
          Keluar
        </button>
      </div>
    </aside>
  )
}
