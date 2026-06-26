import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PvEClient from '@/components/game/PvEClient'

export default async function PvEPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: bosses }] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('id, level, xp, armor_stat, intellect_stat, title, users(display_name)')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('quests')
      .select('*')
      .eq('type', 'raid_boss')
      .eq('is_published', true)
      .order('xp_reward'),
  ])

  const { data: battleHistory } = profile ? await supabase
    .from('student_quests')
    .select('*, quests(title, type, xp_reward)')
    .eq('student_id', profile.id)
    .order('completed_at', { ascending: false })
    .limit(5) : { data: [] }

  return (
    <PvEClient
      profile={profile}
      bosses={bosses ?? []}
      battleHistory={battleHistory ?? []}
    />
  )
}
