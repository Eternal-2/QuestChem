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
  { value: '',          label: 'Semua tipe' },
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
    <div className="max-w-5xl mx-auto">
      {/* Quest dari kelas — prioritas, tampil di atas */}
      {classAssignedQuests.length > 0 && (
        <div className="mb-8 bg-slate-900/60 backdrop-blur rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span>🏰</span>
            <h2 className="text-base font-bold text-white">Quest dari Kelasmu</h2>
            <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
              {classAssignedQuests.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classAssignedQuests.map((cq: any) => {
              const q = cq.quests
              const progress = progressMap[q.id]
              const isDone = progress?.status === 'completed'
              return (
                <Link
                  key={q.id}
                  href={`/murid/quests/${q.id}`}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    isDone
                      ? 'bg-teal-500/5 border-teal-500/20'
                      : 'bg-slate-800/60 border-slate-700/50 hover:border-purple-500/40'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{TYPE_EMOJI[q.type] ?? '📜'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{q.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-yellow-400">+{q.xp_reward} XP</span>
                      {isDone && <span className="text-xs text-teal-400">✓ Selesai</span>}
                      {cq.due_at && !isDone && (
                        <span className="text-xs text-orange-400">
                          Deadline: {new Date(cq.due_at).toLocaleDateString('id-ID')}
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          📜 Quests
        </h1>
        <p className="text-slate-400 text-sm">Selesaikan quest untuk mendapat XP dan tingkatkan kemampuan kimiamu</p>
      </div>

      {/* Topic filter — PENTING: prefix /murid ditambahkan, sebelumnya /quests?... saja menyebabkan 404 */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TOPICS.map(t => (
          <Link
            key={t.id}
            href={`/murid/quests?topic=${t.id}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTopic === t.id
                ? 'bg-teal-500 text-slate-900'
                : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-teal-500/40'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </Link>
        ))}
      </div>

      {/* Type filter — PENTING: prefix /murid juga ditambahkan di sini */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TYPE_FILTERS.map(t => (
          <Link
            key={t.value}
            href={`/murid/quests?topic=${activeTopic}&type=${t.value}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeType === t.value
                ? 'bg-white text-slate-900'
                : 'bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:border-slate-600'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Quest grid */}
      {quests && quests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-slate-300">Tidak ada quest ditemukan</p>
          <p className="text-sm mt-1">Coba topik atau tipe yang berbeda</p>
        </div>
      )}
    </div>
  )
}
