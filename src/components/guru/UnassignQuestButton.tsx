'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UnassignQuestButton({ classId, questId }: { classId: string; questId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleUnassign() {
    setLoading(true)
    await supabase
      .from('class_quests')
      .delete()
      .eq('class_id', classId)
      .eq('quest_id', questId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleUnassign}
      disabled={loading}
      title="Hapus dari kelas ini"
      className="text-slate-500 hover:text-red-400 transition-colors text-xs flex-shrink-0 disabled:opacity-50"
    >
      {loading ? '...' : '✕'}
    </button>
  )
}
