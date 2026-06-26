import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LabReportsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login-guru')

  // Ambil semua kelas guru
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)

  const classIds = classes?.map(c => c.id) ?? []

  // Ambil semua student_id dari kelas guru
  const { data: classMembers } = classIds.length > 0
    ? await supabase
        .from('class_members')
        .select('student_id, classes(name)')
        .in('class_id', classIds)
    : { data: [] }

  const studentIds = classMembers?.map((m: any) => m.student_id) ?? []

  // Ambil lab experiments dari semua siswa
  const { data: experiments } = studentIds.length > 0
    ? await supabase
        .from('lab_experiments')
        .select(`
          *,
          student_profiles(
            id,
            users(display_name, username)
          )
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  // Statistik
  const totalExperiments = experiments?.length ?? 0
  const explosions = experiments?.filter((e: any) => e.is_explosion) ?? []
  const successReactions = experiments?.filter((e: any) => e.reaction_found && !e.is_explosion) ?? []
  const uniqueStudents = new Set(experiments?.map((e: any) => e.student_id)).size

  // Group by student
  const byStudent = experiments?.reduce((acc: any, exp: any) => {
    const id = exp.student_id
    if (!acc[id]) acc[id] = { profile: exp.student_profiles, experiments: [] }
    acc[id].experiments.push(exp)
    return acc
  }, {}) ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">🔬 Lab Reports</h1>
          <p className="text-slate-400 text-sm mt-0.5">Pantau eksperimen siswa di laboratorium pribadi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🧪', label: 'Total Eksperimen', value: totalExperiments, color: 'text-teal-400' },
          { icon: '✅', label: 'Reaksi Berhasil', value: successReactions.length, color: 'text-green-400' },
          { icon: '💥', label: 'Insiden Ledakan', value: explosions.length, color: 'text-red-400' },
          { icon: '👥', label: 'Siswa Aktif', value: uniqueStudents, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Explosions alert */}
      {explosions.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">💥</span>
          <div>
            <div className="font-bold text-red-400 mb-1">Ada {explosions.length} insiden ledakan!</div>
            <div className="text-sm text-slate-400">
              {explosions.slice(0, 3).map((e: any, i: number) => {
                const name = e.student_profiles?.users?.display_name ?? 'Siswa'
                return <span key={i}>{name}{i < 2 && explosions.length > 1 ? ', ' : ''}</span>
              })}
              {explosions.length > 3 && ` dan ${explosions.length - 3} lainnya`} menyebabkan ledakan di lab.
            </div>
          </div>
        </div>
      )}

      {/* Belum ada data */}
      {totalExperiments === 0 && (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">🔬</div>
          <h2 className="text-white font-bold mb-2">Belum ada eksperimen</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Data akan muncul saat siswa mulai bereksperimen di Virtual Lab.
          </p>
        </div>
      )}

      {/* Per siswa */}
      {Object.values(byStudent).length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">Laporan Per Siswa</h2>
          {Object.values(byStudent).map((data: any) => {
            const name = data.profile?.users?.display_name ?? data.profile?.users?.username ?? 'Siswa'
            const exps = data.experiments as any[]
            const boom = exps.filter(e => e.is_explosion).length
            const success = exps.filter(e => e.reaction_found && !e.is_explosion).length
            const fail = exps.filter(e => !e.reaction_found).length

            return (
              <div key={data.profile?.id} className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
                {/* Header siswa */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="font-bold text-white">{name}</div>
                  <div className="flex items-center gap-2 ml-auto flex-wrap">
                    <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-full">✅ {success} berhasil</span>
                    <span className="text-xs bg-slate-800/60 border border-slate-700/30 text-slate-400 px-2 py-1 rounded-full">❌ {fail} gagal</span>
                    {boom > 0 && <span className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded-full">💥 {boom} ledakan</span>}
                  </div>
                </div>

                {/* List eksperimen */}
                <div className="divide-y divide-slate-800/60">
                  {exps.slice(0, 5).map((exp: any) => (
                    <div key={exp.id} className={`px-5 py-3 flex items-center gap-3 ${exp.is_explosion ? 'bg-red-500/5' : ''}`}>
                      <span className="text-lg flex-shrink-0">
                        {exp.is_explosion ? '💥' : exp.reaction_found ? '✅' : '❌'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-300">
                          {exp.is_explosion
                            ? 'Reaksi menyebabkan ledakan!'
                            : exp.reaction_found
                            ? 'Reaksi kimia berhasil ditemukan'
                            : 'Tidak ada reaksi yang terjadi'}
                        </div>
                        {exp.notes && (
                          <div className="text-xs text-slate-500 truncate">{exp.notes}</div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(exp.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                  {exps.length > 5 && (
                    <div className="px-5 py-2 text-xs text-slate-500 text-center">
                      +{exps.length - 5} eksperimen lainnya
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
