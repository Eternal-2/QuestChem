import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GuildPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Check if student is in a guild
  const { data: membership } = await supabase
    .from('guild_members')
    .select('*, guilds(*)')
    .eq('student_id', profile?.id)
    .single()

  const guild = (membership as any)?.guilds

  if (!guild) {
    // Not in a guild — show join/create
    const { data: topGuilds } = await supabase
      .from('guilds')
      .select('*, guild_members(count)')
      .order('total_xp', { ascending: false })
      .limit(5)

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🏰 Guild Hall</h1>
          <p className="text-gray-500 text-sm mt-0.5">Join a guild to participate in raids and earn bonus XP</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-center">
          <div className="text-5xl mb-3">🏰</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">You're not in a guild yet</h2>
          <p className="text-gray-500 text-sm mb-5">Join an existing guild or create your own!</p>
          <div className="flex gap-3 justify-center">
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              + Create Guild
            </button>
          </div>
        </div>

        {/* Top guilds */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">🌟 Top Guilds</h3>
          <div className="space-y-3">
            {topGuilds?.map((g, i) => (
              <div key={g.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{g.name}</div>
                  <div className="text-xs text-gray-400">Level {g.level} • {g.total_xp.toLocaleString()} XP</div>
                </div>
                <button className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors font-medium">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // In a guild — show guild page
  const { data: members } = await supabase
    .from('guild_members')
    .select('*, student_profiles(*, users(username, display_name))')
    .eq('guild_id', guild.id)
    .order('xp_contributed', { ascending: false })

  const raidBoss = guild.raid_boss ?? {}
  const raidHpPct = raidBoss.hp_max ? Math.round((raidBoss.hp_current / raidBoss.hp_max) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Guild banner */}
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 rounded-2xl overflow-hidden mb-6 p-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-transparent to-transparent" />
        <div className="relative flex items-end gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">⚙️ Lvl {guild.level}</span>
              {guild.rank && <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">Rank #{guild.rank}</span>}
            </div>
            <h1 className="text-3xl font-bold text-white">{guild.name}</h1>
            {guild.description && <p className="text-blue-200 text-sm mt-1">{guild.description}</p>}
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
            Join Raid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Raid boss + members */}
        <div className="col-span-2 space-y-5">
          {/* Active raid boss */}
          {raidBoss.is_active ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-500">⚠️</span>
                <span className="font-semibold text-red-700">Active Guild Raid</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-red-900 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">👹</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-800 mb-1">{raidBoss.name}</h3>
                  <p className="text-sm text-red-600 mb-3">Combine balancing equations to chip away its armor!</p>
                  <div className="h-3 bg-red-200 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${raidHpPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-red-600">
                    <span>HP: {raidBoss.hp_current?.toLocaleString()} / {raidBoss.hp_max?.toLocaleString()}</span>
                    <span>{100 - raidHpPct}% Defeated</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">😴</div>
              <p className="text-gray-500 text-sm">No active raid. The guild leader can start one!</p>
            </div>
          )}

          {/* Tabs placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex border-b border-gray-100">
              {['Members', 'Guild Chat', 'Missions', 'Achievements', 'Shop'].map((tab, i) => (
                <button key={tab} className={`px-4 py-3 text-sm font-medium transition-colors ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
            {/* Members table */}
            <div className="p-4">
              <div className="space-y-2">
                {members?.map((m, i) => {
                  const sp = (m as any).student_profiles
                  const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Alchemist'
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ${['bg-purple-500','bg-blue-500','bg-green-500','bg-gray-400'][i % 4]}`}>
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{name}</div>
                        <div className="text-xs text-gray-400">Level {sp?.level}</div>
                      </div>
                      <div className="text-xs font-semibold text-yellow-600">⭐ {m.xp_contributed.toLocaleString()} XP</div>
                      <div className={`text-xs font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-500' : i === 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                        #{i + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top contributors */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Contributors</h3>
            <span>🏆</span>
          </div>
          <div className="space-y-3">
            {members?.slice(0, 4).map((m, i) => {
              const sp = (m as any).student_profiles
              const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Alchemist'
              const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-gray-400']
              const rankColors = ['text-yellow-500', 'text-gray-500', 'text-orange-500', 'text-gray-400']
              return (
                <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${colors[i]}`}>
                    L{sp?.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
                    <div className="text-xs text-gray-400">⭐ {m.xp_contributed.toLocaleString()} XP</div>
                  </div>
                  <div className={`text-sm font-bold ${rankColors[i]}`}>#{i + 1}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
