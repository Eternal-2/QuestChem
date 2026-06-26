import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QuestCard from '@/components/game/QuestCard'
import type { Quest, StudentQuest, QuestStatus } from '@/types/database'

const TOPICS = [
  { id: 'all',            label: 'Semua',          emoji: '✨' },
  { id: 'acid_base',      label: 'Asam & Basa',    emoji: '🧪' },
  { id: 'stoichiometry',  label: 'Stoikiometri',   emoji: '⚖️' },
  { id: 'bonding',        label: 'Ikatan Kimia',   emoji: '🔗' },
  { id: 'periodic_table', label: 'Tabel Periodik', emoji: '📊' },
  { id: 'reactions',      label: 'Reaksi Kimia',   emoji: '💥' },
]

const TYPE_FILTERS = [
  { value: '',           label: 'Semua tipe' },
  { value: 'quiz',       label: '📝 Quiz' },
  { value: 'lab',        label: '🔬 Lab' },
  { value: 'read',       label: '📖 Bacaan' },
  { value: 'mini_game',  label: '🎮 Mini-Game' },
]

const TYPE_EMOJI: Record<string, string> = {
  quiz: '📝', lab: '🔬', read: '📖', mini_game: '🎮',
}

export default async function QuestsPage({
  searchParams,
}: {
  searchParams: { topic?: string; type?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileQuery = supabase
    .from('student_profiles')
    .select('id, level, xp')
    .eq('user_id', user.id)
    .single()

  let questsQuery = supabase.from('quests').select('*').eq('is_published', true)
  if (searchParams.topic && searchParams.topic !== 'all') questsQuery = questsQuery.eq('topic', searchParams.topic)
  if (searchParams.type) questsQuery = questsQuery.eq('type', searchParams.type)
  questsQuery = questsQuery.order('xp_reward')

  // Query independen dijalankan paralel
  const [{ data: profile }, { data: quests }] = await Promise.all([
    profileQuery,
    questsQuery,
  ])

  // Quest yang ditugaskan lewat kelas yang diikuti siswa ini
  let classAssignedQuests: any[] = []
  const progressMap: Record<string, StudentQuest> = {}

  if (profile) {
    const [{ data: sq }, { data: myClasses }] = await Promise.all([
      supabase
        .from('student_quests')
        .select('*')
        .eq('student_id', profile.id),
      supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', profile.id),
    ])

    sq?.forEach(item => { progressMap[item.quest_id] = item })

    const classIds = myClasses?.map(c => c.class_id) ?? []
    if (classIds.length > 0) {
      const { data: cq } = await supabase
        .from('class_quests')
        .select('quest_id, due_at, quests(*)')
        .in('class_id', classIds)

      classAssignedQuests = cq?.filter(item => item.quests) ?? []
    }
  }

  const activeTopic = searchParams.topic ?? 'all'
  const activeType = searchParams.type ?? ''

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      
      {/* Quest dari kelas — prioritas, tampil di atas */}
      {classAssignedQuests.length > 0 && (
        <div className="mb-8 bg-slate-900/60 backdrop-blur rounded-3xl p-5 sm:p-6 border border-purple-500/20 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🏰</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Quest dari Kelasmu</h2>
            <span className="text-xs font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full">
              {classAssignedQuests.length} Tugas
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classAssignedQuests.map((cq: any) => {
              const q = cq.quests
              const progress = progressMap[q.id]
              const isDone = progress?.status === 'completed'
              return (
                <Link
                  key={q.id}
                  href={`/murid/quests/${q.id}`}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    isDone
                      ? 'bg-teal-500/10 border-teal-500/30 opacity-70 hover:opacity-100'
                      : 'bg-slate-800/80 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
                    {TYPE_EMOJI[q.type] ?? '📜'}
                  </span>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="text-sm font-bold text-white truncate mb-1">{q.title}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md">+{q.xp_reward} XP</span>
                      {isDone && <span className="text-xs font-bold text-teal-400">✓ Selesai</span>}
                      {cq.due_at && !isDone && (
                        <span className="text-xs font-medium text-orange-400 flex items-center gap-1">
                          ⏰ {new Date(cq.due_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Header Utama */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-2 flex items-center gap-3">
          <span>📜</span> Papan Quest
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">Selesaikan quest untuk meraup XP dan tingkatkan level kimiamu!</p>
      </div>

{/* Filter Section (Responsive Horizontal Scroll di HP) */}
      <div className="space-y-4 mb-8">
        
        {/* Topic filter */}
        <div className="flex gap-3 overflow-x-auto md:flex-wrap pb-3 snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 scroll-pl-5 sm:scroll-pl-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TOPICS.map(t => (
            <Link
              key={t.id}
              href={`/murid/quests?topic=${t.id}&type=${activeType}`}
              className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTopic === t.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 shadow-md shadow-teal-500/20'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:border-teal-500/50'
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </Link>
          ))}
          {/* Dummy spacer agar item terakhir tidak menabrak layar kanan di HP */}
          <div className="w-2 flex-shrink-0 sm:hidden" />
        </div>

        {/* Type filter */}
        <div className="flex gap-2.5 overflow-x-auto md:flex-wrap pb-2 snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 scroll-pl-5 sm:scroll-pl-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TYPE_FILTERS.map(t => (
            <Link
              key={t.value}
              href={`/murid/quests?topic=${activeTopic}&type=${t.value}`}
              className={`flex-shrink-0 snap-start px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeType === t.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {t.label}
            </Link>
          ))}
          {/* Dummy spacer agar item terakhir tidak menabrak layar kanan di HP */}
          <div className="w-2 flex-shrink-0 sm:hidden" />
        </div>

      </div>

      {/* Quest grid */}
      {quests && quests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quests.map((quest: Quest) => {
            const progress = progressMap[quest.id]
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                status={(progress?.status ?? 'active') as QuestStatus}
                score={progress?.score ?? undefined}
                xpEarned={progress?.xp_earned}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-800 border-dashed">
          <div className="text-5xl mb-4 opacity-80">🔍</div>
          <p className="text-lg font-bold text-slate-300">Quest tidak ditemukan</p>
          <p className="text-sm mt-2 text-slate-500">Coba pilih kombinasi topik atau tipe yang berbeda.</p>
        </div>
      )}
    </div>
  )
}