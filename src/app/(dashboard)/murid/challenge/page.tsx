import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ChallengePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/murid/home')

  const { data: challenges } = await supabase
    .from('pvp_challenges')
    .select(`
      *,
      quests(id, title, type, xp_reward),
      challenger:student_profiles!pvp_challenges_challenger_id_fkey(id, level, users(username, display_name)),
      opponent:student_profiles!pvp_challenges_opponent_id_fkey(id, level, users(username, display_name))
    `)
    .or(`challenger_id.eq.${profile.id},opponent_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })

  const sentByMe = challenges?.filter(c => c.challenger_id === profile.id) ?? []
  const receivedByMe = challenges?.filter(c => c.opponent_id === profile.id) ?? []

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400">
            🥊 Tantangan
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Lawan rekor terbaik temanmu, bukan real-time!</p>
        </div>

        {/* Tantangan yang harus aku mainkan (aku jadi challenger, belum selesai) */}
        <div>
          <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <span>⚔️</span> Tantangan yang Kamu Buat
          </h2>
          {sentByMe.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 text-center text-slate-500 text-sm">
              Belum ada tantangan yang kamu buat. Coba tantang teman dari halaman PvE Battle!
            </div>
          ) : (
            <div className="space-y-2">
              {sentByMe.map((c: any) => {
                const opponentName = c.opponent?.users?.display_name ?? c.opponent?.users?.username ?? 'Lawan'
                return (
                  <div key={c.id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-lg flex-shrink-0">
                      ⚔️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">vs {opponentName}</div>
                      <div className="text-xs text-slate-400">{c.quests?.title} · Rekor lawan: {c.opponent_score}%</div>
                    </div>

                    {c.status === 'pending' ? (
                      <Link
                        href={`/murid/challenge/${c.id}`}
                        className="text-xs font-semibold text-white bg-purple-500 hover:bg-purple-400 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        Mainkan →
                      </Link>
                    ) : (
                      <span className={`text-xs font-bold flex-shrink-0 px-2.5 py-1 rounded-full border ${
                        c.result === 'challenger_win'
                          ? 'text-teal-400 bg-teal-500/10 border-teal-500/30'
                          : c.result === 'draw'
                          ? 'text-slate-400 bg-slate-500/10 border-slate-500/30'
                          : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {c.result === 'challenger_win' ? '🏆 Menang' : c.result === 'draw' ? '🤝 Seri' : '💀 Kalah'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tantangan yang masuk ke aku (aku jadi target, hanya info — tidak perlu aksi) */}
        <div>
          <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <span>📥</span> Kamu Ditantang Oleh
          </h2>
          {receivedByMe.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 text-center text-slate-500 text-sm">
              Belum ada yang menantang rekormu.
            </div>
          ) : (
            <div className="space-y-2">
              {receivedByMe.map((c: any) => {
                const challengerName = c.challenger?.users?.display_name ?? c.challenger?.users?.username ?? 'Penantang'
                return (
                  <div key={c.id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center text-lg flex-shrink-0">
                      🛡️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{challengerName} menantangmu</div>
                      <div className="text-xs text-slate-400">{c.quests?.title} · Rekormu: {c.opponent_score}%</div>
                    </div>
                    {c.status === 'pending' ? (
                      <span className="text-xs text-slate-500 flex-shrink-0">Menunggu lawan main</span>
                    ) : (
                      <span className={`text-xs font-bold flex-shrink-0 px-2.5 py-1 rounded-full border ${
                        c.result === 'opponent_win'
                          ? 'text-teal-400 bg-teal-500/10 border-teal-500/30'
                          : c.result === 'draw'
                          ? 'text-slate-400 bg-slate-500/10 border-slate-500/30'
                          : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {c.result === 'opponent_win' ? '🏆 Rekormu menang' : c.result === 'draw' ? '🤝 Seri' : '😬 Rekormu dilewati'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
