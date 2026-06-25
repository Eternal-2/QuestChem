import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AiTutorChat from '@/components/game/AiTutorChat'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ✅ OPTIMASI: Ambil profile dulu (butuh id untuk query berikutnya)
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, xp, level, title, streak_days, users(display_name)')
    .eq('user_id', user.id)
    .single()

  // ✅ OPTIMASI: Parallel queries untuk quest data
  const [{ data: recentQuests }, { data: recommended }] = await Promise.all([
    supabase
      .from('student_quests')
      .select('xp_earned, quest_id, quests(title, topic, xp_reward, type)')
      .eq('student_id', profile?.id ?? '')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(3),
    supabase
      .from('quests')
      .select('id, title, description, type, xp_reward')
      .eq('is_published', true)
      .order('xp_reward', { ascending: false })
      .limit(4),
  ])

  const username = (profile as any)?.users?.display_name ?? 'Alchemist'
  const currentXp = profile?.xp ?? 0
  const level = profile?.level ?? 1
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
    return { label: 'Baca', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300' }
  }

  // Filter recommended — exclude yang sudah completed
  const completedIds = new Set(recentQuests?.map(sq => sq.quest_id) ?? [])
  const filteredRecommended = recommended?.filter(q => !completedIds.has(q.id)) ?? []

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* HEADER: Welcome + XP Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-[0.15em] font-semibold mb-1">
              Selamat datang kembali, Alchemist
            </p>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-purple-400">
              {username}
            </h1>
          </div>
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

        {/* ACHIEVEMENT BANNER */}
        {recentQuests && recentQuests.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-900/40 via-cyan-900/20 to-slate-900/40 backdrop-blur p-5 flex items-center gap-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,212,191,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,212,191,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative w-12 h-12 bg-yellow-400/10 border border-yellow-500/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏆</div>
            <div className="relative">
              <div className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-0.5">Quest Selesai!</div>
              <div className="font-bold text-white">{(recentQuests[0].quests as any)?.title}</div>
              <div className="text-slate-400 text-sm">
                Kamu mendapat <span className="text-yellow-400 font-bold">+{recentQuests[0].xp_earned} XP</span> — terus semangat!
              </div>
            </div>
          </div>
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '⚗️', label: 'Quest Selesai', value: recentQuests?.length ?? 0 },
            { icon: '✨', label: 'Total XP', value: currentXp },
            { icon: '🔥', label: 'Hari Beruntun', value: profile?.streak_days ?? 0 },
            { icon: '🏅', label: 'Peringkat', value: '#42' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3 hover:border-slate-600/70 transition-colors">
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <AiTutorChat username={username} />

          <div className="space-y-4">
            {/* Adaptive Hint */}
            <div className="bg-slate-900/60 backdrop-blur border border-orange-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="font-bold text-sm text-white">Petunjuk Adaptif</span>
                <span className="ml-auto text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Stoikiometri</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Kamu sering melewatkan langkah konversi terakhir. Ingat:{' '}
                <span className="text-white font-semibold">Massa = Mol × Massa Molar</span>
              </p>
              <button className="w-full text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl px-4 py-2 transition-colors">
                Latihan Ini →
              </button>
            </div>

            {/* Recommended Quests */}
            <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <span className="font-bold text-sm text-white">Rekomendasi</span>
                <span className="ml-auto text-xs text-slate-500">Untukmu</span>
              </div>
              <div className="space-y-2">
                {filteredRecommended.slice(0, 3).map(quest => {
                  const badge = questTypeBadge(quest.type)
                  return (
                    <a key={quest.id} href={`/murid/quests/${quest.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-slate-600/60 transition-all group">
                      <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center text-lg flex-shrink-0">
                        {questTypeIcon(quest.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate group-hover:text-teal-300 transition-colors">{quest.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-md border bg-gradient-to-r ${badge.color}`}>{badge.label}</span>
                          <span className="text-xs text-yellow-400">+{quest.xp_reward} XP</span>
                        </div>
                      </div>
                      <span className="text-slate-600 group-hover:text-teal-400 transition-colors text-sm">›</span>
                    </a>
                  )
                })}
                {filteredRecommended.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-sm">Belum ada quest tersedia</div>
                )}
              </div>
              <a href="/murid/quests" className="block mt-3 text-center text-xs text-teal-400 hover:text-teal-300 transition-colors font-semibold">
                Lihat semua quest →
              </a>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        {recentQuests && recentQuests.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <span className="font-bold text-white">Aktivitas Terbaru</span>
              </div>
              <a href="/murid/achievements" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Lihat semua →</a>
            </div>
            <div className="space-y-2">
              {recentQuests.map((sq, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-base flex-shrink-0">
                    {questTypeIcon((sq.quests as any)?.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{(sq.quests as any)?.title}</div>
                    <div className="text-xs text-slate-400">{(sq.quests as any)?.topic}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-yellow-400">+{sq.xp_earned} XP</div>
                    <div className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full mt-0.5">Selesai</div>
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
