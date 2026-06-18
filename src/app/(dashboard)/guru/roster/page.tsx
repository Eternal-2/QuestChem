import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RosterPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)

  const classIds = classes?.map(c => c.id) ?? []

  const { data: members } = classIds.length > 0
    ? await supabase
        .from('class_members')
        .select('*, student_profiles(*, users(username, display_name)), classes(name)')
        .in('class_id', classIds)
        .order('joined_at', { ascending: false })
    : { data: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">👥 Roster Siswa</h1>
        <p className="text-slate-400 text-sm mt-0.5">Semua siswa dari seluruh kelas yang kamu ajar</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
        {members && members.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                <th className="pb-3 font-medium">Nama Siswa</th>
                <th className="pb-3 font-medium">Kelas</th>
                <th className="pb-3 font-medium">Level</th>
                <th className="pb-3 font-medium">Total XP</th>
                <th className="pb-3 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => {
                const sp = m.student_profiles
                const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Siswa'
                return (
                  <tr key={m.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                          {name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-sm text-slate-400">{m.classes?.name}</td>
                    <td className="py-3.5 text-sm text-slate-300">Lvl {sp?.level ?? 1}</td>
                    <td className="py-3.5">
                      <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                        ⭐ {(sp?.xp ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-orange-400">🔥 {sp?.streak_days ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm">Belum ada siswa di kelas manapun</p>
          </div>
        )}
      </div>
    </div>
  )
}
