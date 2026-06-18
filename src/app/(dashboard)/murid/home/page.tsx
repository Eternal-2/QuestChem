import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*, users(username, display_name)')
    .eq('user_id', user.id)
    .single()

  const { data: recentQuests } = await supabase
    .from('student_quests')
    .select('*, quests(title, topic, xp_reward, type)')
    .eq('student_id', profile?.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(3)

  const completedIds = recentQuests?.map(sq => sq.quest_id) ?? []
  const { data: recommended } = await supabase
    .from('quests')
    .select('*')
    .eq('is_published', true)
    .not('id', 'in', completedIds.length ? `(${completedIds.join(',')})` : '(null)')
    .order('xp_reward', { ascending: false })
    .limit(4)

  const username = (profile as any)?.users?.display_name ?? 'Alchemist'
  const currentXp = (profile as any)?.xp ?? 0
  const level = Math.floor(currentXp / 500) + 1
  const xpInLevel = currentXp % 500
  const xpPercent = Math.round((xpInLevel / 500) * 100)

  const questTypeIcon = (type: string) => {
    if (type === 'quiz') return '📝'
    if (type === 'lab') return '🔬'
    return '📖'
  }

  const questTypeBadge = (type: string) => {
    if (type === 'quiz') return { label: 'Quiz', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300' }
    if (type === 'lab') return { label: 'Lab', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-300' }
    return { label: 'Read', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300' }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-cyan-500/3 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── HEADER: Welcome + XP Bar ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-[0.15em] font-semibold mb-1">
              Welcome back, Alchemist
            </p>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-purple-400">
              {username}
            </h1>
          </div>

          {/* Level + XP */}
          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl px-5 py-3 min-w-[280px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-xl font-black text-white shadow-[0_0_16px_rgba(45,212,191,0.4)] flex-shrink-0">
              {level}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-teal-400 font-bold">Level {level} Alchemist</span>
                <span className="text-slate-400">{xpInLevel} / 500 XP</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RECENT ACHIEVEMENT BANNER ── */}
        {recentQuests && recentQuests.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-900/40 via-cyan-900/20 to-slate-900/40 backdrop-blur p-5 flex items-center gap-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative w-12 h-12 bg-yellow-400/10 border border-yellow-500/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              🏆
            </div>
            <div className="relative">
              <div className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-0.5">Quest Completed!</div>
              <div className="font-bold text-white">
                {(recentQuests[0].quests as any)?.title}
              </div>
              <div className="text-slate-400 text-sm">
                You earned <span className="text-yellow-400 font-bold">+{recentQuests[0].xp_earned} XP</span> — momentum building!
              </div>
            </div>
            <div className="ml-auto text-4xl opacity-20 select-none hidden md:block">⚗️</div>
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '⚗️', label: 'Quests Done', value: recentQuests?.length ?? 0, color: 'teal' },
            { icon: '✨', label: 'Total XP', value: currentXp, color: 'cyan' },
            { icon: '🔥', label: 'Day Streak', value: 3, color: 'orange' },
            { icon: '🏅', label: 'Rank', value: '#42', color: 'purple' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3 hover:border-slate-600/70 transition-colors"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT: AI Tutor (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
            {/* Card header */}
            <div className="px-5 pt-5 pb-3 border-b border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-base">🤖</div>
              <div>
                <div className="font-bold text-sm text-white">Professor Nova</div>
                <div className="text-xs text-teal-400">AI Chemistry Tutor</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs text-slate-400">Online</span>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 p-5 flex flex-col justify-center items-center gap-5 min-h-[280px]">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                🤖
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-sm p-4 max-w-sm w-full">
                <p className="text-sm text-slate-300 leading-relaxed">
                  "Welcome back, <span className="text-teal-400 font-semibold">{username}</span>! Your last session covered acids and bases. Ready to tackle stoichiometry today? 🧪"
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 focus-within:border-teal-500/50 transition-colors">
                <input
                  type="text"
                  placeholder="Ask Professor Nova anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button className="w-8 h-8 bg-teal-500 hover:bg-teal-400 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 text-sm">
                  ➤
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">

            {/* Adaptive Hint */}
            <div className="bg-slate-900/60 backdrop-blur border border-orange-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="font-bold text-sm text-white">Adaptive Hint</span>
                <span className="ml-auto text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  Stoichiometry
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                You often miss the final conversion step. Remember:{' '}
                <span className="text-white font-semibold">Mass = Moles × Molar Mass</span>
              </p>
              <button className="w-full text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl px-4 py-2 transition-colors">
                Practice This →
              </button>
            </div>

            {/* Recommended Quests */}
            <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <span className="font-bold text-sm text-white">Recommended</span>
                <span className="ml-auto text-xs text-slate-500">For you</span>
              </div>
              <div className="space-y-2">
                {recommended?.slice(0, 3).map(quest => {
                  const badge = questTypeBadge(quest.type)
                  return (
                    <a
                      key={quest.id}
                      href={`/quests/${quest.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-slate-600/60 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center text-lg flex-shrink-0">
                        {questTypeIcon(quest.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
                          {quest.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-md border bg-gradient-to-r ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-yellow-400">+{quest.xp_reward} XP</span>
                        </div>
                      </div>
                      <span className="text-slate-600 group-hover:text-teal-400 transition-colors text-sm">›</span>
                    </a>
                  )
                })}
                {(!recommended || recommended.length === 0) && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    No quests available yet
                  </div>
                )}
              </div>
              <a href="/quests" className="block mt-3 text-center text-xs text-teal-400 hover:text-teal-300 transition-colors font-semibold">
                View all quests →
              </a>
            </div>
          </div>
        </div>

        {/* ── RECENT ACTIVITY ── */}
        {recentQuests && recentQuests.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <span className="font-bold text-white">Recent Activity</span>
              </div>
              <a href="/achievements" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                View all →
              </a>
            </div>
            <div className="space-y-2">
              {recentQuests.map((sq, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-base flex-shrink-0">
                    {questTypeIcon((sq.quests as any)?.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {(sq.quests as any)?.title}
                    </div>
                    <div className="text-xs text-slate-400">{(sq.quests as any)?.topic}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-yellow-400">+{sq.xp_earned} XP</div>
                    <div className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full mt-0.5">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
