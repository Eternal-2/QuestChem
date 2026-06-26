import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BackpackClient from '@/components/game/BackpackClient'
import type { ItemType } from '@/types/database'

export default async function BackpackPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, armor_stat, intellect_stat')
    .eq('user_id', user.id)
    .single()

  const { data: inventory } = await supabase
    .from('student_inventory')
    .select('*, items(*)')
    .eq('student_id', profile?.id ?? '')
    .order('obtained_at', { ascending: false })

  return (
    <BackpackClient
      inventory={inventory ?? []}
      profileId={profile?.id ?? ''}
      armorStat={profile?.armor_stat ?? 0}
      intellectStat={profile?.intellect_stat ?? 0}
    />
  )
}
