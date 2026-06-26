import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TokoClient from '@/components/game/TokoClient'

export default async function TokoPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: items }] = await Promise.all([
    supabase.from('student_profiles').select('id, xp, level').eq('user_id', user.id).single(),
    supabase.from('items').select('*').eq('is_active', true).order('rarity'),
  ])

  const { data: inventory } = await supabase
    .from('student_inventory')
    .select('item_id, quantity')
    .eq('student_id', profile?.id ?? '')

  const ownedMap: Record<string, number> = {}
  inventory?.forEach((inv: any) => { ownedMap[inv.item_id] = inv.quantity })

  return (
    <TokoClient
      items={items ?? []}
      ownedMap={ownedMap}
      currentXp={profile?.xp ?? 0}
      profileId={profile?.id ?? ''}
    />
  )
}
