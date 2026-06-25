'use client'
import Link from 'next/link'

export default function TeacherHeader() {
  return (
    <header className="fixed top-0 left-[240px] right-0 h-14 bg-[#0d1117]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center px-6 z-30">

      {/* Kiri: label */}
      <div className="flex-1">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
          Command Center
        </span>
      </div>

      {/* Kanan: aksi */}
      <div className="flex items-center gap-2">

        {/* Notifikasi */}
        <Link
          href="/guru/notifikasi"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-400 hover:text-purple-400 transition-all relative"
          title="Notifikasi"
        >
          🔔
          {/* Badge notifikasi — bisa dijadikan dinamis nanti */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full border border-[#0d1117]" />
        </Link>

        {/* Buat Quest shortcut */}
        <Link
          href="/guru/quest-bank/baru"
          className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-400 hover:text-purple-300 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
        >
          <span>📜 </span>
          <span>Buat Quest</span>
        </Link>

        {/* Profil */}
        <Link
          href="/guru/profil"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-400 hover:text-purple-400 transition-all"
          title="Profil Guru"
        >
          👤
        </Link>
      </div>
    </header>
  )
}
