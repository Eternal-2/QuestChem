'use client'
import Link from 'next/link'
import type { StudentProfile } from '@/types/database'

interface HeaderProps {
  profile: StudentProfile | null
  setSidebarOpen?: (value:boolean)=>void
}

// 👇 PERBAIKAN DI SINI: Tambahkan setSidebarOpen di dalam kurung kurawal
export default function Header({ profile, setSidebarOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 md:left-[240px] right-0 h-14 bg-[#0d1117]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center px-4 md:px-6 z-30">
      
      {/* Kiri: breadcrumb / judul */}
      <div className="flex items-center gap-3 flex-1">
        <button onClick={() => setSidebarOpen?.(true)} className="md:hidden text-white text-xl">
          ☰
        </button>
        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
          Akademi Kimia
        </span>
      </div>

      {/* Kanan: stats + aksi */}
      <div className="flex items-center gap-2">

        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5">
          <span className="text-base">🔥</span>
          <span className="text-sm font-bold text-orange-400">{profile?.streak_days ?? 0}</span>
        </div>

        {/* Leaderboard */}
        <Link
          href="/murid/achievements"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-yellow-500/40 hover:bg-yellow-500/5 text-slate-400 hover:text-yellow-400 transition-all"
          title="Pencapaian"
        >
          🏆
        </Link>

        {/* Profil */}
        <Link
          href="/murid/profile"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-teal-500/40 hover:bg-teal-500/5 text-slate-400 hover:text-teal-400 transition-all"
          title="Profil"
        >
          👤
        </Link>
      </div>
    </header>
  )
}