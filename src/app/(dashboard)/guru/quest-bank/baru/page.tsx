import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QuestBuilder from '@/components/guru/QuestBuilder'

export default async function BuatQuestPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/guru/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin')) {
    redirect('/murid/home')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/guru/quest-bank" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        ← Kembali ke Quest Bank
      </Link>

      <div>
        <h1 className="text-2xl font-black text-white">+ Buat Quest Baru</h1>
        <p className="text-slate-400 text-sm mt-0.5">Rancang soal, bacaan, atau langkah lab untuk siswamu</p>
      </div>

      <QuestBuilder />
    </div>
  )
}
