import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import KelasActions from '@/components/guru/KelasActions'
import ClassQuestAssigner from '@/components/guru/ClassQuestAssigner'
import UnassignQuestButton from '@/components/guru/UnassignQuestButton'

const TYPE_EMOJI: Record<string, string> = {
  quiz: '📝', lab: '🔬', read: '📖', mini_game: '🎮',
}

export default async function KelasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login-guru')

  // Parallel: kelas + members + quest milik guru (untuk assigner) + quest yang sudah ditugaskan
  const [
    { data: kelas },
    { data: members },
    { data: ownQuests },
    { data: classQuests },
  ] = await Promise.all([
    supabase
      .from('classes')
      .select('id, name, cohort, join_code, created_at')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single(),
    supabase
      .from('class_members')
      .select('id, joined_at, student_profiles(id, level, xp, title, users(display_name, username))')
      .eq('class_id', id)
      .order('joined_at', { ascending: false }),
    supabase
      .from('quests')
      .select('id, title, type, xp_reward')
      .eq('created_by', user.id)
      .eq('is_published', true),
    supabase
      .from('class_quests')
      .select('quest_id, due_at, assigned_at, quests(id, title, type, xp_reward, difficulty)')
      .eq('class_id', id)
      .order('assigned_at', { ascending: false }),
  ])

  if (!kelas) notFound()

  const totalStudents = members?.length ?? 0
  const avgLevel = totalStudents > 0
    ? Math.round((members?.reduce((s: number, m: any) => s + (m.student_profiles?.level ?? 1), 0) ?? 0) / totalStudents)
    : 0
  const totalXp = members?.reduce((s: number, m: any) => s + (m.student_profiles?.xp ?? 0), 0) ?? 0

  const assignedQuestIds = classQuests?.map(cq => cq.quest_id) ?? []

  return (
    <div className="space-y-6">
      <Link href="/guru/kelas" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        ← Kembali ke Kelas
      </Link>

      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-3xl">
              🏰
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{kelas.name}</h1>
              {kelas.cohort && <p className="text-sm text-slate-400 mt-0.5">{kelas.cohort}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400">Kode:</span>
              <span className="font-mono font-black text-teal-400 tracking-widest">{kelas.join_code}</span>
            </div>
            <KelasActions kelas={kelas} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
          {[
            { label: 'Siswa', value: totalStudents, color: 'text-white' },
            { label: 'Rata-rata Level', value: `Lvl ${avgLevel || '-'}`, color: 'text-teal-400' },
            { label: 'Total XP Kelas', value: totalXp.toLocaleString(), color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Roster */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span>👥</span>
            <h3 className="font-bold text-white text-sm">Roster Siswa</h3>
            <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">{totalStudents}</span>
          </div>

          {members && members.length > 0 ? (
            <div className="space-y-2">
              {members.map((m: any, i: number) => {
                const sp = m.student_profiles
                const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Siswa'
                const mastery = Math.min(100, (sp?.level ?? 1) * 15)
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 transition-colors">
                    <span className="text-xs text-slate-500 w-5 text-center flex-shrink-0">{i + 1}</span>
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{name}</div>
                      <div className="text-xs text-slate-400">{sp?.title ?? 'Novice Chemist'} · Level {sp?.level ?? 1}</div>
                    </div>
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${mastery >= 80 ? 'bg-teal-400' : mastery >= 50 ? 'bg-cyan-400' : 'bg-orange-400'}`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8">{mastery}%</span>
                    </div>
                    <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-500/20 px-2 py-1 rounded-full flex-shrink-0">
                      ⭐ {(sp?.xp ?? 0).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-300 font-semibold mb-1">Belum ada siswa</p>
              <p className="text-slate-500 text-sm">Bagikan kode kelas ke siswamu untuk join</p>
            </div>
          )}
        </div>

        {/* Kolom kanan */}
        <div className="space-y-4">
          {/* Cara join */}
          <div className="bg-slate-900/60 backdrop-blur border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span>📲</span>
              <h3 className="font-bold text-white text-sm">Cara Siswa Join</h3>
            </div>
            <ol className="space-y-2 text-xs text-slate-400 mb-4">
              <li className="flex gap-2"><span className="text-purple-400 font-bold flex-shrink-0">1.</span>Login sebagai Murid</li>
              <li className="flex gap-2"><span className="text-purple-400 font-bold flex-shrink-0">2.</span>Buka menu <strong className="text-slate-300">Gabung Kelas</strong> di sidebar</li>
              <li className="flex gap-2"><span className="text-purple-400 font-bold flex-shrink-0">3.</span>Masukkan kode berikut:</li>
            </ol>
            <div className="flex items-center justify-center bg-slate-800/60 border border-slate-700/50 rounded-xl py-4">
              <span className="font-mono text-2xl font-black text-teal-400 tracking-[0.3em]">{kelas.join_code}</span>
            </div>
          </div>

          {/* Quest kelas — sekarang terhubung ke data sungguhan */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>📜</span>
                <h3 className="font-bold text-white text-sm">Quest Kelas</h3>
                {classQuests && classQuests.length > 0 && (
                  <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">{classQuests.length}</span>
                )}
              </div>
              <ClassQuestAssigner
                classId={kelas.id}
                assignedQuestIds={assignedQuestIds}
                availableQuests={ownQuests ?? []}
              />
            </div>

            {classQuests && classQuests.length > 0 ? (
              <div className="space-y-2">
                {classQuests.map((cq: any) => {
                  const q = cq.quests
                  if (!q) return null
                  return (
                    <div
                      key={cq.quest_id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30"
                    >
                      <span className="text-sm flex-shrink-0">{TYPE_EMOJI[q.type] ?? '📜'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{q.title}</div>
                        <div className="text-xs text-yellow-400">+{q.xp_reward} XP</div>
                      </div>
                      <UnassignQuestButton classId={kelas.id} questId={cq.quest_id} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Belum ada quest ditugaskan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
