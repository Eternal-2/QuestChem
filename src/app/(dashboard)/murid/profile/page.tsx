import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import XpBar from '@/components/game/XpBar'
import { LEVEL_TITLES } from '@/lib/game-constants'

const AFFINITY_CONFIG = [
  { key: 'affinity_fire',  label: 'Fire',  emoji: '🔥', color: 'bg-red-500' },
  { key: 'affinity_water', label: 'Water', emoji: '💧', color: 'bg-blue-500' },
  { key: 'affinity_earth', label: 'Earth', emoji: '🌿', color: 'bg-green-500' },
  { key: 'affinity_air',   label: 'Air',   emoji: '💨', color: 'bg-gray-400' },
  { key: 'affinity_metal', label: 'Metal', emoji: '⚙️', color: 'bg-purple-500' },
]

const CORE_STATS = [
  { key: 'chemistry_knowledge_level', label: 'Chemistry Knowledge', emoji: '📘', color: 'bg-blue-500' },
  { key: 'reaction_mastery_level',    label: 'Reaction Mastery',    emoji: '🧪', color: 'bg-green-500' },
  { key: 'safety_protocol_level',     label: 'Safety Protocol',     emoji: '🛡️', color: 'bg-purple-500' },
]

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get achievements
  const { data: studentAchievements } = await supabase
    .from('student_achievements')
    .select('*, achievements(*)')
    .eq('student_id', profile?.id)
    .order('unlocked_at', { ascending: false })
    .limit(6)

  // Get equipped items
  const { data: equippedItems } = await supabase
    .from('student_inventory')
    .select('*, items(*)')
    .eq('student_id', profile?.id)
    .eq('is_equipped', true)

  if (!profile) return <div className="text-center py-20 text-gray-400">Profile not found.</div>

  const level = profile.level
  const title = LEVEL_TITLES[level] ?? 'Alchemist'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-6">

        {/* Left — Avatar & XP */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center text-4xl mx-auto">
              🧑‍🔬
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              LVL {level}
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-4">{userData?.display_name ?? userData?.username}</h2>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mt-1">
            🧪 {title.toUpperCase()}
          </div>

          {/* XP bar */}
          <div className="mt-5">
            <div className="text-xs text-gray-400 mb-1">
              Experience to Lvl {level + 1}
            </div>
            <div className="text-sm font-semibold text-blue-600 mb-2">
              {profile.xp.toLocaleString()} / {(profile.xp + profile.xp_to_next_level).toLocaleString()} XP
            </div>
            <XpBar xp={profile.xp} level={level} xpToNextLevel={profile.xp_to_next_level} showLabel={false} size="md" />
          </div>

          {/* Equipped gear */}
          <div className="mt-6 text-left">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🎽 Equipped Gear</div>
            <div className="flex gap-2 flex-wrap">
              {equippedItems && equippedItems.length > 0
                ? equippedItems.map(inv => (
                    <div key={inv.id} title={(inv.items as any)?.name}
                      className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-xl cursor-pointer hover:border-blue-300 transition-colors">
                      ⚙️
                    </div>
                  ))
                : [1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-lg">
                      +
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Middle — Core Stats & Achievements */}
        <div className="space-y-5">
          {/* Core stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span>📊</span>
              <h3 className="font-semibold text-gray-900">Core Stats</h3>
            </div>
            <div className="space-y-3">
              {CORE_STATS.map(stat => {
                const val = (profile as any)[stat.key] as number
                const pct = Math.min((val / 10) * 100, 100)
                return (
                  <div key={stat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stat.emoji}</span>
                        <span className="text-sm text-gray-700">{stat.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">Lvl {val}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <h3 className="font-semibold text-gray-900">Achievements</h3>
              </div>
              <a href="/achievements" className="text-xs text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-3">
              {studentAchievements && studentAchievements.length > 0
                ? studentAchievements.map(sa => {
                    const ach = (sa as any).achievements
                    return (
                      <div key={sa.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">🏅</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{ach?.name}</div>
                          <div className="text-xs text-gray-400 truncate">{ach?.description}</div>
                        </div>
                        {ach?.xp_bonus > 0 && (
                          <span className="text-xs font-semibold text-green-600 flex-shrink-0">+{ach.xp_bonus} XP</span>
                        )}
                      </div>
                    )
                  })
                : (
                  <div className="text-center py-6 text-gray-300">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-sm">No achievements yet. Complete quests to unlock!</div>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* Right — Element Affinity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span>✨</span>
            <h3 className="font-semibold text-gray-900">Element Affinity</h3>
          </div>
          <div className="space-y-3">
            {AFFINITY_CONFIG.map(af => {
              const val = (profile as any)[af.key] as number
              return (
                <div key={af.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl flex-shrink-0">{af.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{af.label}</span>
                      <span className="text-xs font-semibold text-gray-600">{val}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${af.color} rounded-full transition-all`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats summary */}
          <div className="mt-5 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{profile.armor_stat}</div>
              <div className="text-xs text-blue-400">ARMOR</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-purple-600">{profile.intellect_stat}</div>
              <div className="text-xs text-purple-400">INTELLECT</div>
            </div>
          </div>

          {/* Streak */}
          <div className="mt-3 bg-orange-50 rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-sm font-bold text-orange-600">{profile.streak_days} Day Streak</div>
              <div className="text-xs text-orange-400">Keep it going!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
