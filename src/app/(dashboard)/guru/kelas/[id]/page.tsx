import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function KelasDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: kelas } = await supabase
    .from('classes')
    .select('*')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single()

  if (!kelas) notFound()

  const { data: members } = await supabase
    .from('class_members')
    .select('*, student_profiles(*, users(username, display_name))')
    .eq('class_id', kelas.id)
    .order('joined_at', { ascending: false })

  // Quest yang sudah pernah di-assign ke kelas ini (placeholder logic, sesuaikan dengan schema final)
  const { data: assignedQuests } = await supabase
    .from('quests')
    .select('*')
    .eq('is_published', true)
    .limit(5)

  const totalStudents = members?.length ?? 0
  const avgLevel = totalStudents > 0
    ? Math.round((members?.reduce((sum: number, m: any) => sum + (m.student_profiles?.level ?? 1), 0) ?? 0) / totalStudents)
    : 0
  const totalXp = members?.reduce((sum: number, m: any) => sum + (m.student_profiles?.xp ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/guru/kelas" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        ← Kembali ke Kelas
      </Link>

      {/* Class header */}
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Kode Kelas:</span>
            <span className="font-mono text-sm font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-lg">
              {kelas.join_code}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="text-center">
            <div className="text-xl font-black text-white">{totalStudents}</div>
            <div className="text-xs text-slate-400">Siswa</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-teal-400">Lvl {avgLevel}</div>
            <div className="text-xs text-slate-400">Rata-rata Level</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-yellow-400">{totalXp.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Total XP Kelas</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Roster — 2 cols */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <h3 className="font-bold text-white text-sm">Roster Siswa</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari siswa..."
                className="pl-9 pr-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-48"
              />
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
            </div>
          </div>

          {members && members.length > 0 ? (
            <div className="space-y-2">
              {members.map((m: any) => {
                const sp = m.student_profiles
                const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Siswa'
                const mastery = Math.min(95, (sp?.level ?? 1) * 15)
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{name}</div>
                      <div className="text-xs text-slate-400">Level {sp?.level ?? 1}</div>
                    </div>
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            mastery >= 80 ? 'bg-teal-400' : mastery >= 50 ? 'bg-cyan-400' : 'bg-orange-400'
                          }`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8">{mastery}%</span>
                    </div>
                    <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-500/20 px-2 py-1 rounded-full flex-shrink-0">
                      ⭐ {(sp?.xp ?? 0).toLocaleString()}
                    </span>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">⋮</button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-slate-400 text-sm mb-1">Belum ada siswa di kelas ini</p>
              <p className="text-slate-500 text-xs">
                Bagikan kode <strong className="text-teal-400">{kelas.join_code}</strong> ke siswamu untuk join
              </p>
            </div>
          )}
        </div>

        {/* Right column: Assign Quest + Settings */}
        <div className="space-y-4">
          {/* Assign Quest */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>📜</span>
                <h3 className="font-bold text-white text-sm">Quest untuk Kelas</h3>
              </div>
              <Link href="/guru/quest-bank" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                + Tambah
              </Link>
            </div>
            <div className="space-y-2">
              {assignedQuests && assignedQuests.length > 0 ? (
                assignedQuests.map(q => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-sm flex-shrink-0">
                      {q.type === 'quiz' ? '📝' : q.type === 'lab' ? '🔬' : '📖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{q.title}</div>
                      <div className="text-xs text-yellow-400">+{q.xp_reward} XP</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Belum ada quest yang ditugaskan
                </div>
              )}
            </div>
          </div>

          {/* Class settings */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span>⚙️</span>
              <h3 className="font-bold text-white text-sm">Pengaturan Kelas</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-slate-300 hover:text-white px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-colors">
                ✏️ Edit nama kelas
              </button>
              <button className="w-full text-left text-sm text-slate-300 hover:text-white px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-colors">
                🔄 Reset kode kelas
              </button>
              <button className="w-full text-left text-sm text-red-400 hover:text-red-300 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors">
                🗑️ Hapus kelas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
