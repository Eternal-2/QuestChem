'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Item, ItemType } from '@/types/database'
import { getItemIcon } from './itemIcon'

const RARITY_STYLE: Record<string, { border: string; badge: string; glow: string }> = {
  common:    { border: 'border-slate-600/50',   badge: 'text-slate-400 bg-slate-500/10 border-slate-500/30',   glow: '' },
  rare:      { border: 'border-blue-500/40',    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30',     glow: 'shadow-[0_0_12px_rgba(59,130,246,0.1)]' },
  epic:      { border: 'border-purple-500/40',  badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.1)]' },
  legendary: { border: 'border-yellow-500/40',  badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', glow: 'shadow-[0_0_16px_rgba(234,179,8,0.15)]' },
  mythic:    { border: 'border-pink-500/40',    badge: 'text-pink-400 bg-pink-500/10 border-pink-500/30',     glow: 'shadow-[0_0_16px_rgba(236,72,153,0.15)]' },
}

const TABS: { id: ItemType | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Semua', emoji: '✨' },
  { id: 'potion', label: 'Potion', emoji: '🧴' },
  { id: 'gear', label: 'Gear', emoji: '⚙️' },
  { id: 'chemical', label: 'Kimia', emoji: '🧪' },
  { id: 'artifact', label: 'Artefak', emoji: '💎' },
]

// Harga item berdasarkan rarity (karena DB mungkin belum ada kolom price)
const RARITY_PRICE: Record<string, number> = {
  common: 100, rare: 300, epic: 600, legendary: 1200, mythic: 2500,
}

interface TokoClientProps {
  items: Item[]
  ownedMap: Record<string, number>
  currentXp: number
  profileId: string
}

export default function TokoClient({ items, ownedMap, currentXp, profileId }: TokoClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all')
  const [selected, setSelected] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [xp, setXp] = useState(currentXp)

  const filtered = activeTab === 'all' ? items : items.filter(i => i.type === activeTab)

  async function handleBuy(item: Item) {
    const price = RARITY_PRICE[item.rarity] ?? 100
    if (xp < price) { setError('XP tidak cukup!'); return }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id, price }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Gagal membeli item'); return }

    setXp(prev => prev - price)
    setSuccess(`${item.name} berhasil dibeli!`)
    setSelected(null)
    setTimeout(() => { setSuccess(null); router.refresh() }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">🛒 Toko Alkemis</h1>
            <p className="text-slate-400 text-sm mt-0.5">Gunakan XP untuk membeli item dan memperkuat karaktermu</p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5">
            <span className="text-lg">⭐</span>
            <div>
              <div className="font-black text-yellow-400 text-sm">{xp.toLocaleString()} XP</div>
              <div className="text-xs text-slate-500">Saldo kamu</div>
            </div>
          </div>
        </div>

        {/* Success/Error */}
        {success && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm text-center">
            ✅ {success}
          </div>
        )}

        {/* Tab filter */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === t.id
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Item grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(item => {
              const rs = RARITY_STYLE[item.rarity] ?? RARITY_STYLE.common
              const price = RARITY_PRICE[item.rarity] ?? 100
              const owned = ownedMap[item.id] ?? 0
              const canAfford = xp >= price

              return (
                <button
                  key={item.id}
                  onClick={() => { setSelected(item); setError(null) }}
                  className={`group bg-slate-900/60 backdrop-blur border ${rs.border} ${rs.glow} rounded-2xl p-4 text-left transition-all hover:scale-[1.02] hover:brightness-110 relative`}
                >
                  {owned > 0 && (
                    <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {owned}
                    </div>
                  )}
                  <div className="text-3xl mb-2">
                    {item.icon_url
                      ? <img src={item.icon_url} alt={item.name} className="w-8 h-8 object-contain" />
                      : getItemIcon(item.name, item.type)
                    }
                  </div>
                  <div className="font-bold text-white text-xs mb-0.5 leading-tight">{item.name}</div>
                  <div className="text-xs text-slate-400 mb-3 line-clamp-2">{item.description}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border capitalize ${rs.badge}`}>
                      {item.rarity}
                    </span>
                    <span className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-slate-500'}`}>
                      ⭐ {price}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-slate-400">Belum ada item di kategori ini</p>
          </div>
        )}

        {/* Modal beli */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              {(() => {
                const rs = RARITY_STYLE[selected.rarity] ?? RARITY_STYLE.common
                const price = RARITY_PRICE[selected.rarity] ?? 100
                const canAfford = xp >= price
                const owned = ownedMap[selected.id] ?? 0

                return (
                  <>
                    <div className={`w-16 h-16 rounded-2xl border ${rs.border} flex items-center justify-center text-4xl mx-auto mb-4`}>
                      {selected.icon_url
                        ? <img src={selected.icon_url} alt={selected.name} className="w-10 h-10 object-contain" />
                        : getItemIcon(selected.name, selected.type)
                      }
                    </div>
                    <h2 className="text-lg font-black text-white text-center mb-1">{selected.name}</h2>
                    <div className="flex justify-center mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${rs.badge}`}>
                        {selected.rarity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm text-center mb-4">{selected.description}</p>

                    {/* Stats */}
                    {selected.stats && Object.keys(selected.stats).length > 0 && (
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4 space-y-1">
                        {selected.stats.armor     && <div className="text-xs text-slate-300">🛡️ +{selected.stats.armor} Armor</div>}
                        {selected.stats.intellect && <div className="text-xs text-slate-300">🧠 +{selected.stats.intellect} Intellect</div>}
                        {selected.stats.xp_bonus  && <div className="text-xs text-teal-400">⭐ +{selected.stats.xp_bonus}% XP Bonus</div>}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                      <span className="text-sm text-slate-400">Harga</span>
                      <span className="font-black text-yellow-400">⭐ {price} XP</span>
                    </div>

                    {owned > 0 && (
                      <div className="text-xs text-teal-400 text-center mb-3">✓ Sudah dimiliki: {owned}x</div>
                    )}

                    {error && <div className="text-xs text-red-400 text-center mb-3">⚠️ {error}</div>}

                    {!canAfford && (
                      <div className="text-xs text-orange-400 text-center mb-3">
                        XP kurang {(price - xp).toLocaleString()} XP lagi
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-xl text-sm">
                        Batal
                      </button>
                      <button
                        onClick={() => handleBuy(selected)}
                        disabled={loading || !canAfford}
                        className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
                      >
                        {loading ? 'Membeli...' : `Beli ⭐ ${price}`}
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
