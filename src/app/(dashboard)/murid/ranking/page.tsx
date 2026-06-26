import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const RANK_STYLE: Record<number, string> = {
  1: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900',
  2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900',
  3: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
}

// Bentuk data yang sudah dinormalisasi — dipakai di seluruh halaman ini
// supaya tidak ada lagi akses field yang strukturnya beda-beda tergantung
// sumber query (view global vs join manual per-kelas).
interface RankedStudent {
  id: string
  rank: number
  name: string
  level: number
  xp: number
  title: string | null
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string }>
}) {
  const { kelas } = await searchParams;
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, level, xp')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/murid/home')

  const { data: myClasses } = await supabase
    .from('class_members')
    .select('classes(id, name)')
    .eq('student_id', profile.id)

  const activeClassId = kelas

  let rankedStudents: RankedStudent[] = []

  if (activeClassId) {
    // Ranking dalam 1 kelas spesifik.
    // PENTING: display_name & username ada di tabel `users`, BUKAN langsung
    // di student_profiles — harus diakses lewat s.users.display_name, bukan
    // s.display_name. Ini bug sebelumnya yang membuat `name` jadi undefined.
    const { data: members } = await supabase
      .from('class_members')
      .select('student_profiles(id, level, xp, title, users(username, display_name))')
      .eq('class_id', activeClassId)

    rankedStudents = (members ?? [])
      .map((m: any) => m.student_profiles)
      .filter((s: any) => s && s.id) // buang baris yang datanya tidak lengkap
      .sort((a: any, b: any) => (b.xp ?? 0) - (a.xp ?? 0))
      .map((s: any, i: number): RankedStudent => ({
        id: s.id,
        rank: i + 1,
        name: s.users?.display_name ?? s.users?.username ?? 'Alchemist',
        level: s.level ?? 1,
        xp: s.xp ?? 0,
        title: s.title ?? null,
      }))
  } else {
    // Ranking global — pakai view leaderboard_global (kolomnya sudah flat:
    // display_name & username langsung di level atas, bukan nested)
    const { data } = await supabase
      .from('leaderboard_global')
      .select('*')
      .limit(50)

    rankedStudents = (data ?? [])
      .filter((s: any) => s && s.student_id)
      .map((s: any): RankedStudent => ({
        id: s.student_id,
        rank: s.rank,
        name: s.display_name ?? s.username ?? 'Alchemist',
        level: s.level ?? 1,
        xp: s.xp ?? 0,
        title: s.title ?? null,
      }))
  }

  const myRank = rankedStudents.find(s => s.id === profile.id)?.rank ?? null
  const top3 = rankedStudents.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400">
            🏆 Ranking
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Siapa alkemis terbaik di QuestChem?</p>
        </div>

        {/* Tab filter: Global / per kelas */}
        <div className="flex gap-2 flex-wrap">
          <a
            href="/murid/ranking"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeClassId
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-yellow-500/40'
            }`}
          >
            🌍 Global
          </a>
          {myClasses?.map((mc: any) => mc.classes && (
            <a
              key={mc.classes.id}
              href={`/murid/ranking?kelas=${mc.classes.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeClassId === mc.classes.id
                  ? 'bg-yellow-500 text-slate-900'
                  : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-yellow-500/40'
              }`}
            >
              🏰 {mc.classes.name}
            </a>
          ))}
        </div>

        {/* Posisi aku */}
        {myRank && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-sm text-slate-300">Posisimu saat ini</div>
              <div className="text-xl font-black text-yellow-400">Peringkat #{myRank}</div>
            </div>
          </div>
        )}

        {/* Top 3 podium — hanya tampil kalau benar-benar ada 3 data lengkap */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-3">
            {[1, 0, 2].map(idx => {
              const s = top3[idx]
              const rank = idx + 1
              const isMe = s.id === profile.id
              return (
                <div
                  key={s.id}
                  className={`flex flex-col items-center justify-end rounded-2xl border p-3 ${
                    rank === 1 ? 'pt-2 pb-4 bg-yellow-500/10 border-yellow-500/30 order-2' :
                    rank === 2 ? 'pb-4 bg-slate-700/20 border-slate-500/30 order-1' :
                    'pb-4 bg-orange-500/10 border-orange-500/30 order-3'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mb-2 ${RANK_STYLE[rank]}`}>
                    {rank}
                  </div>
                  <div className={`text-xs font-bold text-center truncate w-full ${isMe ? 'text-teal-300' : 'text-white'}`}>
                    {s.name}{isMe && ' (Kamu)'}
                  </div>
                  <div className="text-xs text-yellow-400 font-semibold mt-1">{s.xp.toLocaleString()} XP</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Daftar lengkap */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-2">
          {rankedStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">Belum ada data ranking</div>
          ) : (
            <div className="space-y-1">
              {rankedStudents.map(s => {
                const isMe = s.id === profile.id
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isMe ? 'bg-teal-500/10 border border-teal-500/30' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <span className={`w-7 text-center text-sm font-bold flex-shrink-0 ${
                      s.rank <= 3 ? 'text-yellow-400' : 'text-slate-500'
                    }`}>
                      {s.rank}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isMe ? 'text-teal-300' : 'text-slate-200'}`}>
                        {s.name}{isMe && ' (Kamu)'}
                      </div>
                      <div className="text-xs text-slate-500">{s.title ?? 'Novice Chemist'} · Lvl {s.level}</div>
                    </div>
                    <span className="text-xs font-bold text-yellow-400 flex-shrink-0">{s.xp.toLocaleString()} XP</span>
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
