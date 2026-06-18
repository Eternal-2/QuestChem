import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QuestCard from '@/components/game/QuestCard'
import type { Quest, StudentQuest, QuestStatus } from '@/types/database'

const TOPICS = [
  { id: 'all',          label: 'All',           emoji: '✨' },
  { id: 'acid_base',    label: 'Acids & Bases', emoji: '🧪' },
  { id: 'stoichiometry',label: 'Stoichiometry', emoji: '⚖️' },
  { id: 'bonding',      label: 'Bonding',       emoji: '🔗' },
  { id: 'periodic_table',label:'Periodic Table', emoji: '📊' },
  { id: 'reactions',    label: 'Reactions',     emoji: '💥' },
]

export default async function QuestsPage({
  searchParams,
}: {
  searchParams: { topic?: string; type?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, level, xp')
    .eq('user_id', user.id)
    .single()

  // Fetch quests
  let query = supabase.from('quests').select('*').eq('is_published', true)
  if (searchParams.topic && searchParams.topic !== 'all') query = query.eq('topic', searchParams.topic)
  if (searchParams.type) query = query.eq('type', searchParams.type)
  const { data: quests } = await query.order('xp_reward')

  // Fetch student progress
  const progressMap: Record<string, StudentQuest> = {}
  if (profile) {
    const { data: sq } = await supabase
      .from('student_quests')
      .select('*')
      .eq('student_id', profile.id)
    sq?.forEach(item => { progressMap[item.quest_id] = item })
  }

  const activeTopic = searchParams.topic ?? 'all'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">📜 Quests</h1>
        <p className="text-gray-500 text-sm">Complete quests to earn XP and level up your chemistry skills</p>
      </div>

      {/* Topic filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TOPICS.map(t => (
          <a
            key={t.id}
            href={`/quests?topic=${t.id}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTopic === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </a>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: '', label: 'All types' },
          { value: 'quiz', label: '📝 Quiz' },
          { value: 'lab', label: '🔬 Lab' },
          { value: 'read', label: '📖 Read' },
          { value: 'mini_game', label: '🎮 Mini-Game' },
        ].map(t => (
          <a
            key={t.value}
            href={`/quests?topic=${activeTopic}&type=${t.value}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (searchParams.type ?? '') === t.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {t.label}
          </a>
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
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No quests found</p>
          <p className="text-sm mt-1">Try a different topic or type</p>
        </div>
      )}
    </div>
  )
}
