import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeacherHomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!userData || userData.role !== 'teacher') redirect('/murid/home')

  // Semua kelas milik guru ini
  const { data: classes } = await supabase
    .from('classes')
    .select('*, class_members(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const totalClasses = classes?.length ?? 0
  const totalStudents = classes?.reduce((sum, c: any) => sum + (c.class_members?.[0]?.count ?? 0), 0) ?? 0

  // Kelas paling aktif (paling banyak siswa) untuk preview roster
  const activeClass = classes?.[0]

  const { data: members } = activeClass
    ? await supabase
        .from('class_members')
        .select('*, student_profiles(*, users(username, display_name))')
        .eq('class_id', activeClass.id)
        .limit(5)
    : { data: [] }

  const avgMastery = 82 // placeholder — bisa dihitung dari student_quests nanti

  const displayName = userData.display_name ?? userData.username

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm uppercase tracking-[0.15em] font-semibold mb-1">
            Selamat datang
          </p>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
            {displayName}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/guru/quest-bank/baru"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors"
          >
            📜 Buat Quest
          </Link>
          <Link
            href="/guru/kelas/baru"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          >
            + Buat Kelas
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🏰', label: 'Total Kelas', value: totalClasses, color: 'purple' },
          { icon: '👥', label: 'Total Siswa', value: totalStudents, color: 'indigo' },
          { icon: '📈', label: 'Rata-rata Mastery', value: `${avgMastery}%`, color: 'teal' },
          { icon: '🔬', label: 'Lab Reports Baru', value: 0, color: 'cyan' },
        ].map(stat => (
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

      {!classes || classes.length === 0 ? (
        /* Empty state — belum punya kelas */
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🏰</div>
          <h2 className="text-lg font-bold text-white mb-2">Belum ada kelas</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Buat kelas pertamamu untuk mulai mengundang siswa, memberikan quest, dan memantau progress belajar mereka.
          </p>
          <Link
            href="/guru/kelas/baru"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          >
            + Buat Kelas Pertama
          </Link>
        </div>
      ) : (
        <>
          {/* Grid: class progress + misconception alert */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Class progress donut */}
            <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 text-center">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2 justify-center text-sm">
                <span>📈</span> Progress Kelas
              </h3>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#2dd4bf" strokeWidth="10"
                    strokeDasharray={`${avgMastery * 2.51} 251`}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-teal-400">{avgMastery}%</span>
                </div>
              </div>
              <p className="text-sm text-slate-400">{activeClass?.name}</p>
            </div>

            {/* Misconception alert */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur border border-orange-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-400 text-xl">⚠️</span>
                <h3 className="font-bold text-orange-300 text-sm">Peringatan Kesalahpahaman Konsep</h3>
              </div>
              <div className="bg-slate-800/60 border border-orange-500/10 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-orange-300 mb-1 text-sm">Konsep Ikatan Ionik</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  45% siswa kesulitan membedakan transfer elektron dan berbagi elektron.
                  Rekomendasi: berikan quest remedial "Pertukaran Elektron".
                </p>
              </div>
              <button className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Kirim Quest Remedial →
              </button>
            </div>
          </div>

          {/* Class list */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>🏰</span>
                <h3 className="font-bold text-white text-sm">Kelas Saya</h3>
              </div>
              <Link href="/guru/kelas" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                Lihat semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classes.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/guru/kelas/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-purple-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-lg flex-shrink-0">
                    🏰
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {c.class_members?.[0]?.count ?? 0} siswa · Kode: {c.join_code}
                    </div>
                  </div>
                  <span className="text-slate-600 group-hover:text-purple-400 transition-colors text-sm">›</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Student roster preview */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>👥</span>
                <h3 className="font-bold text-white text-sm">Roster Siswa — {activeClass?.name}</h3>
              </div>
              <Link href="/guru/roster" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                Lihat semua →
              </Link>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                  <th className="pb-3 font-medium">Nama Siswa</th>
                  <th className="pb-3 font-medium">Level</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Total XP</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members && members.length > 0 ? (
                  members.map((m: any) => {
                    const sp = m.student_profiles
                    const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Siswa'
                    const mastery = Math.min(95, (sp?.level ?? 1) * 15)
                    return (
                      <tr key={m.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {name.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-200">{name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-sm text-slate-400">Lvl {sp?.level ?? 1}</td>
                        <td className="py-3.5 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  mastery >= 80 ? 'bg-teal-400' : mastery >= 50 ? 'bg-cyan-400' : 'bg-orange-400'
                                }`}
                                style={{ width: `${mastery}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium w-8 ${
                              mastery >= 80 ? 'text-teal-400' : mastery >= 50 ? 'text-cyan-400' : 'text-orange-400'
                            }`}>
                              {mastery}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                            ⭐ {(sp?.xp ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button className="text-slate-500 hover:text-slate-300 transition-colors text-lg">⋮</button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500 text-sm">
                      Belum ada siswa. Bagikan kode kelas:{' '}
                      <strong className="text-teal-400">{activeClass?.join_code}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
