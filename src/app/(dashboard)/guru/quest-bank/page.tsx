import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QuestActions from '@/components/guru/QuestActions'

const TYPE_EMOJI: Record<string, string> = {
  quiz: '📝', lab: '🔬', read: '📖', mini_game: '🎮',
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   'text-teal-400 bg-teal-400/10 border-teal-500/20',
  medium: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
  hard:   'text-red-400 bg-red-400/10 border-red-500/20',
}

export default async function QuestBankPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  // Hanya quest yang dibuat guru ini sendiri (bukan select('*') semua quest di sistem)
  const { data: quests } = await supabase
    .from('quests')
    .select('id, title, description, type, difficulty, topic, xp_reward, is_published, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const publishedCount = quests?.filter(q => q.is_published).length ?? 0
  const draftCount = (quests?.length ?? 0) - publishedCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">📜 Quest Bank</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Kelola semua quest yang kamu buat
            {quests && quests.length > 0 && (
              <span className="text-slate-500"> — {publishedCount} aktif, {draftCount} draft</span>
            )}
          </p>
        </div>
        <Link
          href="/guru/quest-bank/baru"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)]"
        >
          + Buat Quest
        </Link>
      </div>

      {quests && quests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quests.map(q => (
            <div
              key={q.id}
              className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/70 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center text-xl">
                  {TYPE_EMOJI[q.type]}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLE[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                  {q.is_published ? (
                    <span className="text-xs text-teal-400 bg-teal-400/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{q.title}</h3>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{q.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{q.topic}</span>
                <span className="text-xs font-semibold text-yellow-400">+{q.xp_reward} XP</span>
              </div>

              <QuestActions questId={q.id} isPublished={q.is_published} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-slate-400 text-sm mb-4">Belum ada quest dibuat</p>
          <Link
            href="/guru/quest-bank/baru"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
          >
            + Buat Quest Pertama
          </Link>
        </div>
      )}
    </div>
  )
}
