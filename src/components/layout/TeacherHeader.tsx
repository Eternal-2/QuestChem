'use client'
import Link from 'next/link'

export default function TeacherHeader({
  setSidebarOpen,
  unreadCount = 0,
}: {
  setSidebarOpen?: (v: boolean) => void
  unreadCount?: number
}) {
  return (
    <header className="fixed top-0 left-0 md:left-[240px] right-0 h-14 bg-[#0d1117]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center px-4 md:px-6 z-30">
      <div className="flex items-center gap-3 flex-1">
        {setSidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white text-xl">☰</button>
        )}
        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Command Center</span>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/guru/notifikasi"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-400 hover:text-purple-400 transition-all relative">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#0d1117] flex items-center justify-center text-white font-black text-[9px] px-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/guru/quest-bank/baru"
          className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-400 hover:text-purple-300 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all">
          <span>📜</span><span>Buat Quest</span>
        </Link>
        <Link href="/guru/profil"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-400 hover:text-purple-400 transition-all">
          👤
        </Link>
      </div>
    </header>
  )
}