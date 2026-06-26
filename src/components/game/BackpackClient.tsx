'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getItemIcon } from './itemIcon'

const RARITY_STYLE: Record<string, { border: string; badge: string; bg: string }> = {
  common:    { border: 'border-slate-600/50',   badge: 'text-slate-400 bg-slate-500/10 border-slate-500/30', bg: 'bg-slate-800/60' },
  rare:      { border: 'border-blue-500/40',    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30',    bg: 'bg-blue-900/20' },
  epic:      { border: 'border-purple-500/40',  badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30', bg: 'bg-purple-900/20' },
  legendary: { border: 'border-yellow-500/40',  badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', bg: 'bg-yellow-900/20' },
  mythic:    { border: 'border-pink-500/40',    badge: 'text-pink-400 bg-pink-500/10 border-pink-500/30',    bg: 'bg-pink-900/20' },
}

const TABS = [
  { id: 'all', label: 'Semua', emoji: '🎒' },
  { id: 'gear', label: 'Gear', emoji: '⚙️' },
  { id: 'potion', label: 'Potion', emoji: '🧴' },
  { id: 'chemical', label: 'Kimia', emoji: '🧪' },
  { id: 'artifact', label: 'Artefak', emoji: '💎' },
]

interface BackpackClientProps {
  inventory: any[]
  profileId: string
  armorStat: number
  intellectStat: number
}

export default function BackpackClient({ inventory, profileId, armorStat, intellectStat }: BackpackClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [localInventory, setLocalInventory] = useState(inventory)

  const filtered = activeTab === 'all'
    ? localInventory
    : localInventory.filter((inv: any) => inv.items?.type === activeTab)

  const equippedItems = localInventory.filter((inv: any) => inv.is_equipped)
  const totalArmor = armorStat + equippedItems.reduce((s: number, inv: any) => s + (inv.items?.stats?.armor ?? 0), 0)
  const totalIntellect = intellectStat + equippedItems.reduce((s: number, inv: any) => s + (inv.items?.stats?.intellect ?? 0), 0)
  const xpBonus = equippedItems.reduce((s: number, inv: any) => s + (inv.items?.stats?.xp_bonus ?? 0), 0)

  async function handleEquipToggle(inv: any) {
    setLoading(true)
    const res = await fetch('/api/inventory/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventory_id: inv.id, equip: !inv.is_equipped }),
    })
    setLoading(false)
    if (res.ok) {
      setLocalInventory(prev => prev.map((i: any) =>
        i.id === inv.id ? { ...i, is_equipped: !inv.is_equipped } : i
      ))
      setSelected((prev: any) => prev?.id === inv.id ? { ...prev, is_equipped: !inv.is_equipped } : prev)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">🎒 Tas Alkemis</h1>
          <p className="text-slate-400 text-sm mt-0.5">Item yang kamu miliki — {localInventory.length}/50 slot terisi</p>
        </div>

        {/* Stat panel */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🛡️', label: 'Total Armor', value: totalArmor, color: 'text-blue-400' },
            { icon: '🧠', label: 'Total Intellect', value: totalIntellect, color: 'text-purple-400' },
            { icon: '⭐', label: 'XP Bonus', value: `+${xpBonus}%`, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab filter */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === t.id
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Inventory grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((inv: any) => {
              const item = inv.items
              if (!item) return null
              const rs = RARITY_STYLE[item.rarity] ?? RARITY_STYLE.common

              return (
                <button
                  key={inv.id}
                  onClick={() => setSelected(inv)}
                  className={`group relative bg-slate-900/60 border ${rs.border} rounded-2xl p-3 text-center transition-all hover:scale-[1.03] ${
                    inv.is_equipped ? 'ring-2 ring-teal-500/50 shadow-[0_0_12px_rgba(45,212,191,0.15)]' : ''
                  }`}
                >
                  {inv.is_equipped && (
                    <div className="absolute top-1.5 left-1.5 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">✓</div>
                  )}
                  {inv.quantity > 1 && (
                    <div className="absolute top-1.5 right-1.5 bg-slate-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {inv.quantity}
                    </div>
                  )}
                  <div className={`${rs.bg} rounded-xl h-12 flex items-center justify-center text-2xl mb-2`}>
                    {getItemIcon(item.name, item.type)}
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight truncate">{item.name}</div>
                  <div className={`text-xs mt-0.5 capitalize ${rs.badge.split(' ')[0]}`}>{item.rarity}</div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-3">🎒</div>
            <p className="text-slate-300 font-semibold">
              {activeTab === 'all' ? 'Tasmu masih kosong' : 'Tidak ada item di kategori ini'}
            </p>
            <p className="text-slate-500 text-sm mt-1">Kunjungi Toko untuk membeli item</p>
          </div>
        )}

        {/* Modal detail item */}
        {selected && selected.items && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              {(() => {
                const item = selected.items
                const rs = RARITY_STYLE[item.rarity] ?? RARITY_STYLE.common
                return (
                  <>
                    <div className={`w-16 h-16 rounded-2xl border ${rs.border} ${rs.bg} flex items-center justify-center text-4xl mx-auto mb-4`}>
                      {getItemIcon(item.name, item.type)}
                    </div>
                    <h2 className="text-lg font-black text-white text-center mb-1">{item.name}</h2>
                    <div className="flex justify-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${rs.badge}`}>{item.rarity}</span>
                      <span className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-full capitalize">{item.type}</span>
                    </div>
                    <p className="text-slate-400 text-sm text-center mb-4">{item.description}</p>

                    {item.stats && Object.keys(item.stats).length > 0 && (
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4 space-y-1.5">
                        {item.stats.armor     && <div className="text-sm text-slate-300 flex justify-between"><span>🛡️ Armor</span><span className="font-bold text-blue-400">+{item.stats.armor}</span></div>}
                        {item.stats.intellect && <div className="text-sm text-slate-300 flex justify-between"><span>🧠 Intellect</span><span className="font-bold text-purple-400">+{item.stats.intellect}</span></div>}
                        {item.stats.xp_bonus  && <div className="text-sm text-slate-300 flex justify-between"><span>⭐ XP Bonus</span><span className="font-bold text-yellow-400">+{item.stats.xp_bonus}%</span></div>}
                      </div>
                    )}

                    <div className="text-xs text-slate-500 text-center mb-4">Jumlah: {selected.quantity}x</div>

                    <div className="flex gap-3">
                      <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-300 rounded-xl text-sm">
                        Tutup
                      </button>
                      {item.type === 'gear' && (
                        <button
                          onClick={() => handleEquipToggle(selected)}
                          disabled={loading}
                          className={`flex-1 py-2.5 font-bold rounded-xl text-sm transition-all disabled:opacity-60 ${
                            selected.is_equipped
                              ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
                              : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                          }`}
                        >
                          {loading ? '...' : selected.is_equipped ? 'Lepas' : '✓ Pakai'}
                        </button>
                      )}
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
