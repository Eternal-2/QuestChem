import Link from 'next/link'

export default function PvEPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="text-7xl mb-6">🐉</div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
          PvE Battle
        </h1>
        <p className="text-slate-400">
          Arena pertarungan kimia segera hadir! Tantang boss menggunakan reaksi kimia dan raih hadiah XP serta item langka.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: '⚗️', label: 'Raid Boss Kimia' },
            { icon: '🏆', label: 'Ranking Pertarungan' },
            { icon: '💊', label: 'Gunakan Item' },
            { icon: '🎯', label: 'Tantang Teman' },
          ].map(f => (
            <div key={f.label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-2">
              <span>{f.icon}</span>
              <span className="text-xs text-slate-400">{f.label}</span>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <span className="text-xs bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-full font-semibold">
            🚧 Segera Hadir
          </span>
        </div>
        <Link href="/murid/home" className="inline-block mt-4 text-sm text-teal-400 hover:text-teal-300 transition-colors">
          ← Kembali ke Home
        </Link>
      </div>
    </div>
  )
}
