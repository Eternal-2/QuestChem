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
  { href: '/murid/home',        label: 'Home',        emoji: '🏠' },
  { href: '/murid/guild',       label: 'Guild',       emoji: '⚔️' },
  { href: '/murid/virtual-lab', label: 'Virtual Lab', emoji: '🔬' },
  { href: '/murid/quests',      label: 'Quests',      emoji: '📜' },
  { href: '/murid/pve',         label: 'PvE Battle',  emoji: '🐉' },
  { href: '/murid/toko',        label: 'Toko',        emoji: '🛒' },
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

  const displayName = user.display_name ?? user.username

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[#0d1117] border-r border-slate-800/80 flex flex-col z-40">
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-purple-400">QuestChem</span>
          <span className="text-[9px] font-bold text-teal-300 bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.5 rounded-full">MURID</span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-[0_0_16px_rgba(45,212,191,0.25)]">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white text-sm truncate">{displayName}</div>
            <div className="text-xs text-teal-400">{profile?.title ?? 'Novice Chemist'}</div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-teal-400 font-semibold">Level {level}</span>
            <span className="text-slate-500">{xp.toLocaleString()} XP</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                active
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-transparent'
              }`}>
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <Link href="/murid/quests" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(45,212,191,0.2)]">
          ▶ Mulai Misi
        </Link>
        <button onClick={handleSignOut} className="w-full text-xs text-slate-600 hover:text-slate-400 py-1.5 transition-colors">
          Keluar
        </button>
      </div>
    </aside>
  )
}
