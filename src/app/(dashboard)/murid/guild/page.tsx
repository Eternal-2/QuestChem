import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GuildPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ambil student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, level, xp, title')
    .eq('user_id', user.id)
    .single()

  // Ambil semua kelas yang diikuti beserta anggota
  const { data: myClasses } = await supabase
    .from('class_members')
    .select(`
      class_id,
      joined_at,
      classes(
        id, name, cohort, join_code,
        users(display_name, username)
      )
    `)
    .eq('student_id', profile?.id ?? '')
    .order('joined_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-teal-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              ⚔️ Guild Saya
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Kelas yang kamu ikuti dan anggota di dalamnya</p>
          </div>
          <Link
            href="/murid/gabung-kelas"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/10 border border-teal-500/30 hover:border-teal-400/50 text-teal-400 hover:text-teal-300 rounded-xl text-sm font-semibold transition-all"
          >
            🏰 + Gabung Kelas
          </Link>
        </div>

        {/* Belum ikut kelas */}
        {(!myClasses || myClasses.length === 0) && (
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">⚔️</div>
            <h3 className="text-lg font-bold text-white mb-2">Belum ada guild</h3>
            <p className="text-slate-400 text-sm mb-6">Bergabung ke kelas untuk mulai berpetualang bersama teman!</p>
            <Link
              href="/murid/gabung-kelas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
            >
              🏰 Gabung Kelas Sekarang
            </Link>
          </div>
        )}

        {/* List kelas */}
        {myClasses && myClasses.map((mc: any) => {
          const kelas = mc.classes
          if (!kelas) return null

          return (
            <GuildCard
              key={mc.class_id}
              kelasId={kelas.id}
              kelasName={kelas.name}
              cohort={kelas.cohort}
              teacherName={kelas.users?.display_name ?? kelas.users?.username ?? 'Guru'}
              joinCode={kelas.join_code}
              joinedAt={mc.joined_at}
              myProfileId={profile?.id}
            />
          )
        })}
      </div>
    </div>
  )
}

// Komponen card per kelas dengan fetch anggota sendiri
async function GuildCard({
  kelasId, kelasName, cohort, teacherName, joinCode, joinedAt, myProfileId
}: {
  kelasId: string
  kelasName: string
  cohort: string | null
  teacherName: string
  joinCode: string
  joinedAt: string
  myProfileId: string | undefined
}) {
  const supabase = await createServerSupabaseClient()

  const { data: members } = await supabase
    .from('class_members')
    .select('student_id, joined_at, student_profiles(id, level, xp, title, users(display_name, username))')
    .eq('class_id', kelasId)
    .order('student_profiles(xp)', { ascending: false })

  const totalMembers = members?.length ?? 0

  return (
    <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header kelas */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
            🏰
          </div>
          <div>
            <h2 className="font-black text-white">{kelasName}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              {cohort && <span>{cohort}</span>}
              {cohort && <span>·</span>}
              <span>👨‍🏫 {teacherName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-black text-white">{totalMembers}</div>
            <div className="text-xs text-slate-500">Anggota</div>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl px-3 py-2">
            <div className="text-xs text-slate-400 mb-0.5">Kode</div>
            <div className="font-mono font-black text-teal-400 tracking-widest text-sm">{joinCode}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard anggota */}
      <div className="p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Peringkat Anggota</p>
        <div className="space-y-2">
          {members?.map((m: any, i: number) => {
            const sp = m.student_profiles
            const name = sp?.users?.display_name ?? sp?.users?.username ?? 'Siswa'
            const isMe = sp?.id === myProfileId
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`

            return (
              <div
                key={m.student_id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isMe
                    ? 'bg-teal-500/10 border-teal-500/30'
                    : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/70'
                }`}
              >
                <span className="text-sm w-7 text-center flex-shrink-0 font-bold">
                  {rankEmoji}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isMe
                    ? 'bg-teal-500 text-white'
                    : 'bg-gradient-to-br from-purple-400 to-indigo-600 text-white'
                }`}>
                  {name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold truncate ${isMe ? 'text-teal-300' : 'text-white'}`}>
                      {name}
                    </span>
                    {isMe && (
                      <span className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Kamu
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{sp?.title ?? 'Novice Chemist'} · Level {sp?.level ?? 1}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-yellow-400">⭐ {(sp?.xp ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-slate-500">XP</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
