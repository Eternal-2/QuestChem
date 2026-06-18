import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ItemCard from '@/components/game/ItemCard'
import type { StudentInventory, ItemType } from '@/types/database'

const TABS: { id: ItemType | 'all'; label: string; emoji: string }[] = [
  { id: 'all',       label: 'All',        emoji: '🎒' },
  { id: 'gear',      label: 'Gear',       emoji: '⚙️' },
  { id: 'chemical',  label: 'Chemicals',  emoji: '🧪' },
  { id: 'potion',    label: 'Potions',    emoji: '🧴' },
  { id: 'artifact',  label: 'Artifacts',  emoji: '💎' },
  { id: 'quest_item',label: 'Quest Items',emoji: '📦' },
]

export default async function BackpackPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let query = supabase
    .from('student_inventory')
    .select('*, items(*)')
    .eq('student_id', profile?.id)
    .order('obtained_at', { ascending: false })

  const activeTab = (searchParams.tab ?? 'all') as ItemType | 'all'
  if (activeTab !== 'all') {
    query = query.eq('items.type', activeTab)
  }

  const { data: inventory } = await query

  // Filter client-side since Supabase join filter needs different approach
  const filtered = activeTab === 'all'
    ? inventory
    : inventory?.filter(inv => (inv.items as any)?.type === activeTab)

  const CAPACITY = 50
  const used = inventory?.length ?? 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🎒 My Backpack
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your chemical compounds, catalysts, and quest artifacts.</p>
        </div>
        {/* Capacity */}
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-3">
          <span className="text-lg">🗂️</span>
          <div>
            <div className="text-xs text-gray-400">CAPACITY</div>
            <div className="text-sm font-semibold text-gray-800">{used} / {CAPACITY} Slots</div>
          </div>
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden ml-1">
            <div
              className={`h-full rounded-full transition-all ${used / CAPACITY > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${(used / CAPACITY) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(tab => (
          <a
            key={tab.id}
            href={`/backpack?tab=${tab.id}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </a>
        ))}
      </div>

      {/* Items grid */}
      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((inv: StudentInventory) => (
            <ItemCard
              key={inv.id}
              item={(inv as any).items}
              quantity={inv.quantity}
              isEquipped={inv.is_equipped}
              size="md"
            />
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 3 - (filtered.length % 3 === 0 ? 3 : filtered.length % 3)) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-3xl aspect-square min-h-[120px]"
            >
              +
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🎒</div>
          <p className="font-medium">Your backpack is empty</p>
          <p className="text-sm mt-1">Complete quests to earn items!</p>
          <a href="/quests" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Go to Quests
          </a>
        </div>
      )}
    </div>
  )
}
