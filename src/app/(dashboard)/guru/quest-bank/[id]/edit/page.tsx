import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import QuestBuilder from '@/components/guru/QuestBuilder'
import type { Quest } from '@/types/database'

export default async function EditQuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: quest } = await supabase
    .from('quests')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id) // hanya pemilik quest yang bisa edit
    .single()

  if (!quest) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/guru/quest-bank" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        ← Kembali ke Quest Bank
      </Link>

      <div>
        <h1 className="text-2xl font-black text-white">✏️ Edit Quest</h1>
        <p className="text-slate-400 text-sm mt-0.5">{quest.title}</p>
      </div>

      <QuestBuilder initialQuest={quest as Quest} />
    </div>
  )
}
