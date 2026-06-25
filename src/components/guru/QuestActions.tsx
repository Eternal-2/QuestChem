'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface QuestActionsProps {
  questId: string
  isPublished: boolean
}

export default function QuestActions({ questId, isPublished }: QuestActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleTogglePublish() {
    setLoading(true)
    await supabase
      .from('quests')
      .update({ is_published: !isPublished })
      .eq('id', questId)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/quests/manage/${questId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    }
    setLoading(false)
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
        <span className="text-xs text-red-300 flex-1">Hapus quest ini?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          {loading ? '...' : 'Ya, hapus'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-xs text-slate-400 hover:text-slate-300"
        >
          Batal
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
      <Link
        href={`/guru/quest-bank/${questId}/edit`}
        className="flex-1 text-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        ✏️ Edit
      </Link>
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className={`flex-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
          isPublished
            ? 'text-orange-300 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
            : 'text-teal-300 bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20'
        }`}
      >
        {loading ? '...' : isPublished ? '⏸ Jadikan Draft' : '✓ Publikasikan'}
      </button>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-slate-500 hover:text-red-400 px-2 py-1.5 transition-colors flex-shrink-0"
      >
        🗑️
      </button>
    </div>
  )
}
