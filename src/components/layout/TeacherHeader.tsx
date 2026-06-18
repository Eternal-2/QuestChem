'use client'
import Link from 'next/link'

export default function TeacherHeader() {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-slate-900/60 backdrop-blur border-b border-slate-700/50 flex items-center px-6 z-30">
      <div className="flex-1">
        <span className="text-sm text-slate-400">Dashboard Pengajar</span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/guru/notifikasi"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
        >
          🔔
        </Link>
        <Link
          href="/guru/profil"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
        >
          👤
        </Link>
      </div>
    </header>
  )
}
