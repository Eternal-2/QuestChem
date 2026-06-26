import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import XpBar from '@/components/game/XpBar'
import { LEVEL_TITLES } from '@/lib/game-constants'

const AFFINITY_CONFIG = [
  { key: 'affinity_fire',  label: 'Fire',  emoji: '🔥', color: 'bg-red-500' },
  { key: 'affinity_water', label: 'Water', emoji: '💧', color: 'bg-blue-500' },
  { key: 'affinity_earth', label: 'Earth', emoji: '🌿', color: 'bg-green-500' },
  { key: 'affinity_air',   label: 'Air',   emoji: '💨', color: 'bg-slate-400' },
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

  if (!profile) return <div className="text-center py-20 text-slate-400">Profile not found.</div>

  const level = profile.level
  const title = LEVEL_TITLES[level] ?? 'Alchemist'

  return (
    <div className="max-w-5xl mx-auto text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Avatar & XP */}
        <div className="bg-[#0d1117] rounded-2xl border border-slate-800/80 p-6 text-center shadow-lg">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-4xl mx-auto shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              {userData?.avatar_url ? (
                <img src={userData.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                '🧑‍🔬'
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 text-xs font-black px-3 py-0.5 rounded-full shadow-lg">
              LVL {level}
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-4">{userData?.display_name ?? userData?.username}</h2>
          <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full mt-2">
            🧪 {title.toUpperCase()}
          </div>

          {/* XP bar */}
          <div className="mt-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1 font-medium tracking-wide uppercase">
              Experience to Lvl {level + 1}
            </div>
            <div className="text-sm font-black text-teal-400 mb-3">
              {profile.xp.toLocaleString()} / {(profile.xp + profile.xp_to_next_level).toLocaleString()} XP
            </div>
            <XpBar xp={profile.xp} level={level} xpToNextLevel={profile.xp_to_next_level} showLabel={false} size="md" />
          </div>

          {/* Equipped gear */}
          <div className="mt-8 text-left">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>🎽</span> Equipped Gear
            </div>
            <div className="flex gap-2 flex-wrap justify-center lg:justify-start">
              {equippedItems && equippedItems.length > 0
                ? equippedItems.map(inv => (
                    <div key={inv.id} title={(inv.items as any)?.name}
                      className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center text-xl cursor-pointer hover:border-teal-400 hover:shadow-[0_0_10px_rgba(45,212,191,0.3)] transition-all">
                      ⚙️
                    </div>
                  ))
                : [1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-lg">
                      +
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Middle — Core Stats & Achievements */}
        <div className="space-y-6">
          {/* Core stats */}
          <div className="bg-[#0d1117] rounded-2xl border border-slate-800/80 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📊</span>
              <h3 className="font-bold text-white tracking-wide">Core Stats</h3>
            </div>
            <div className="space-y-4">
              {CORE_STATS.map(stat => {
                const val = (profile as any)[stat.key] as number
                const pct = Math.min((val / 10) * 100, 100)
                return (
                  <div key={stat.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stat.emoji}</span>
                        <span className="text-sm font-medium text-slate-300">{stat.label}</span>
                      </div>
                      <span className="text-xs font-bold text-teal-400">Lvl {val}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#0d1117] rounded-2xl border border-slate-800/80 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="font-bold text-white tracking-wide">Achievements</h3>
              </div>
              <a href="/murid/achievements" className="text-xs font-bold text-teal-500 hover:text-teal-400 transition-colors">View All</a>
            </div>
            <div className="space-y-3">
              {studentAchievements && studentAchievements.length > 0
                ? studentAchievements.map(sa => {
                    const ach = (sa as any).achievements
                    return (
                      <div key={sa.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center text-xl flex-shrink-0">🏅</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-200 truncate">{ach?.name}</div>
                          <div className="text-xs text-slate-400 truncate">{ach?.description}</div>
                        </div>
                        {ach?.xp_bonus > 0 && (
                          <span className="text-xs font-black text-emerald-400 flex-shrink-0">+{ach.xp_bonus} XP</span>
                        )}
                      </div>
                    )
                  })
                : (
                  <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed text-slate-400">
                    <div className="text-3xl mb-2 opacity-50">🔒</div>
                    <div className="text-sm font-medium">Belum ada pencapaian.</div>
                    <div className="text-xs mt-1">Selesaikan quest untuk membuka!</div>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* Right — Element Affinity & Summary */}
        <div className="bg-[#0d1117] rounded-2xl border border-slate-800/80 p-5 shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">✨</span>
            <h3 className="font-bold text-white tracking-wide">Element Affinity</h3>
          </div>
          
          <div className="space-y-3 flex-1">
            {AFFINITY_CONFIG.map(af => {
              const val = (profile as any)[af.key] as number
              return (
                <div key={af.key} className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                  <span className="text-xl flex-shrink-0">{af.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-300">{af.label}</span>
                      <span className="text-xs font-black text-slate-400">{val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${af.color} rounded-full shadow-[0_0_8px_currentColor] transition-all duration-1000`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats summary */}
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]">{profile.armor_stat}</div>
              <div className="text-[10px] font-bold tracking-widest text-blue-500/80 mt-1">ARMOR</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]">{profile.intellect_stat}</div>
              <div className="text-[10px] font-bold tracking-widest text-purple-500/80 mt-1">INTELLECT</div>
            </div>
          </div>

          {/* Streak */}
          <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="text-3xl animate-pulse">🔥</div>
            <div>
              <div className="text-sm font-black text-orange-400">{profile.streak_days} Day Streak</div>
              <div className="text-xs font-medium text-orange-500/70">Pertahankan semangatmu!</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}