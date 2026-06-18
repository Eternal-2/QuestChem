import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import QuizRunner from '@/components/game/QuizRunner'
import type { Quest } from '@/types/database'
import { DIFFICULTY_COLORS } from '@/types/database'

export default async function QuestDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quest } = await supabase
    .from('quests')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (!quest) notFound()

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: progress } = profile
    ? await supabase
        .from('student_quests')
        .select('*')
        .eq('student_id', profile.id)
        .eq('quest_id', quest.id)
        .single()
    : { data: null }

  const TYPE_EMOJI: Record<string, string> = {
    quiz: '📝', lab: '🔬', read: '📖', mini_game: '🎮',
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <a href="/quests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        ← Back to Quests
      </a>

      {/* Quest header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {TYPE_EMOJI[quest.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[quest.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                {quest.difficulty}
              </span>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{quest.topic}</span>
              {progress?.status === 'completed' && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ Completed</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{quest.title}</h1>
            <p className="text-sm text-gray-500">{quest.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-blue-600">+{quest.xp_reward}</div>
            <div className="text-xs text-gray-400">XP Reward</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-50">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">{quest.estimated_minutes} min</div>
            <div className="text-xs text-gray-400">Estimated</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">
              {Array.isArray(quest.content) ? quest.content.length : 0}
            </div>
            <div className="text-xs text-gray-400">
              {quest.type === 'quiz' ? 'Questions' : quest.type === 'read' ? 'Sections' : 'Steps'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">{progress?.attempts ?? 0}</div>
            <div className="text-xs text-gray-400">Attempts</div>
          </div>
        </div>
      </div>

      {/* Quiz / Lab / Read runner */}
      <QuizRunner quest={quest as Quest} previousScore={progress?.score ?? null} />
    </div>
  )
}
