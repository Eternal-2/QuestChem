'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Quest } from '@/types/database'

interface ClassQuestAssignerProps {
  classId: string
  assignedQuestIds: string[]
  availableQuests: Pick<Quest, 'id' | 'title' | 'type' | 'xp_reward'>[]
}

const TYPE_EMOJI: Record<string, string> = {
  quiz: '📝', lab: '🔬', read: '📖', mini_game: '🎮',
}

export default function ClassQuestAssigner({ classId, assignedQuestIds, availableQuests }: ClassQuestAssignerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const unassigned = availableQuests.filter(q => !assignedQuestIds.includes(q.id))

  async function handleAssign(questId: string) {
    setLoading(questId)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('class_quests').insert({
      class_id: classId,
      quest_id: questId,
      assigned_by: user?.id,
    })

    router.refresh()
    setLoading(null)
    setOpen(false)
  }

  async function handleUnassign(questId: string) {
    setLoading(questId)
    await supabase
      .from('class_quests')
      .delete()
      .eq('class_id', classId)
      .eq('quest_id', questId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
      >
        + Tambah
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-20 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 max-h-72 overflow-y-auto">
          {unassigned.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              Semua quest published sudah ditugaskan, atau belum ada quest dibuat.
            </p>
          ) : (
            unassigned.map(q => (
              <button
                key={q.id}
                onClick={() => handleAssign(q.id)}
                disabled={loading === q.id}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors text-left disabled:opacity-50"
              >
                <span className="text-sm flex-shrink-0">{TYPE_EMOJI[q.type]}</span>
                <span className="text-xs text-slate-200 flex-1 truncate">{q.title}</span>
                <span className="text-xs text-yellow-400 flex-shrink-0">+{q.xp_reward}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
