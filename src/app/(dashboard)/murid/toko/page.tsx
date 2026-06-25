import Link from 'next/link'

export default function TokoPage() {
  const items = [
    { emoji: '🧪', name: 'Potion Regenerasi', desc: 'Pulihkan HP saat battle', price: 150, rarity: 'Common', color: 'border-gray-500/30' },
    { emoji: '⚡', name: 'Katalis Reaksi', desc: '2x kecepatan reaksi kimia', price: 300, rarity: 'Rare', color: 'border-blue-500/30' },
    { emoji: '🛡️', name: 'Pelindung Kimia', desc: 'Kurangi damage dari boss', price: 500, rarity: 'Epic', color: 'border-purple-500/30' },
    { emoji: '💎', name: 'Kristal XP', desc: '+500 XP instan', price: 1000, rarity: 'Legendary', color: 'border-yellow-500/30' },
    { emoji: '🔥', name: 'Eliksir Api', desc: 'Bonus affinity_fire +20', price: 400, rarity: 'Rare', color: 'border-orange-500/30' },
    { emoji: '❄️', name: 'Eliksir Es', desc: 'Bonus affinity_water +20', price: 400, rarity: 'Rare', color: 'border-cyan-500/30' },
  ]

  const rarityColor: Record<string, string> = {
    Common: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    Rare: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    Epic: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    Legendary: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">🛒 Toko Alkemis</h1>
            <p className="text-slate-400 text-sm mt-0.5">Beli item untuk membantu petualanganmu</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
            <span>⭐</span>
            <span className="font-black text-yellow-400 text-sm">0 XP</span>
            <span className="text-slate-500 text-xs">tersedia</span>
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🚧</span>
          <div>
            <p className="text-orange-400 font-semibold text-sm">Toko Segera Hadir!</p>
            <p className="text-slate-400 text-xs">Sistem pembelian item akan aktif setelah fitur XP dan inventory selesai.</p>
          </div>
        </div>

        {/* Preview items */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Preview Item</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map(item => (
              <div key={item.name} className={`bg-slate-900/60 backdrop-blur border ${item.color} rounded-2xl p-4 opacity-70`}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="font-bold text-white text-sm mb-0.5">{item.name}</div>
                <div className="text-xs text-slate-400 mb-3">{item.desc}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rarityColor[item.rarity]}`}>
                    {item.rarity}
                  </span>
                  <span className="text-yellow-400 text-xs font-bold">⭐ {item.price}</span>
                </div>
                <button disabled className="w-full mt-3 py-1.5 bg-slate-800/60 border border-slate-700/30 text-slate-500 rounded-xl text-xs cursor-not-allowed">
                  Segera Hadir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
