import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function KelasListPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: classes } = await supabase
    .from('classes')
    .select('*, class_members(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">🏰 Kelas Saya</h1>
          <p className="text-slate-400 text-sm mt-0.5">Kelola semua kelas dan undang siswamu</p>
        </div>
        <Link
          href="/guru/kelas/baru"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)]"
        >
          + Buat Kelas
        </Link>
      </div>

      {!classes || classes.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🏰</div>
          <h2 className="text-lg font-bold text-white mb-2">Belum ada kelas</h2>
          <p className="text-slate-400 text-sm mb-6">Buat kelas pertamamu untuk mulai mengajar di QuestChem.</p>
          <Link
            href="/guru/kelas/baru"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
          >
            + Buat Kelas Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c: any) => (
            <Link
              key={c.id}
              href={`/guru/kelas/${c.id}`}
              className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
                  🏰
                </div>
                <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded-full font-mono">
                  {c.join_code}
                </span>
              </div>
              <h3 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                {c.name}
              </h3>
              {c.cohort && <p className="text-xs text-slate-400 mb-3">{c.cohort}</p>}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>👥</span>
                <span>{c.class_members?.[0]?.count ?? 0} siswa</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
