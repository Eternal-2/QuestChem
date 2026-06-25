import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import QuizRunner from '@/components/game/QuizRunner'
import type { Quest } from '@/types/database'

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'text-teal-400 bg-teal-400/10 border-teal-500/20',
  medium: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
  hard:   'text-red-400 bg-red-400/10 border-red-500/20',
}

const TYPE_EMOJI: Record<string, string> = {
  quiz: '📝', lab: '🔬', read: '📖', mini_game: '🎮',
}

const TYPE_LABEL: Record<string, string> = {
  quiz: 'Pertanyaan', lab: 'Langkah', read: 'Bagian', mini_game: 'Tahap',
}

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back — diperbaiki dari /quests (404) menjadi /murid/quests */}
      <Link
        href="/murid/quests"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        ← Kembali ke Quests
      </Link>

      {/* Quest header */}
      <div className="bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-slate-800/60 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {TYPE_EMOJI[quest.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLE[quest.difficulty as keyof typeof DIFFICULTY_STYLE]}`}>
                {quest.difficulty}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">{quest.topic}</span>
              {progress?.status === 'completed' && (
                <span className="text-xs text-teal-400 bg-teal-400/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                  ✓ Selesai
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{quest.title}</h1>
            <p className="text-sm text-slate-400">{quest.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-yellow-400">+{quest.xp_reward}</div>
            <div className="text-xs text-slate-500">XP Reward</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="text-center">
            <div className="text-sm font-semibold text-white">{quest.estimated_minutes} menit</div>
            <div className="text-xs text-slate-500">Estimasi</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-white">
              {Array.isArray(quest.content) ? quest.content.length : 0}
            </div>
            <div className="text-xs text-slate-500">{TYPE_LABEL[quest.type] ?? 'Item'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-white">{progress?.attempts ?? 0}</div>
            <div className="text-xs text-slate-500">Percobaan</div>
          </div>
        </div>
      </div>

      {/* Quiz / Lab / Read runner */}
      <QuizRunner quest={quest as Quest} previousScore={progress?.score ?? null} />
    </div>
  )
}
