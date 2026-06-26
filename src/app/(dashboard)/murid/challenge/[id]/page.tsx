import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChallengeBattleClient from '@/components/game/ChallengeBattleClient'

export default async function ChallengeBattlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, level, users(display_name)')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/murid/home')

  const { data: challenge } = await supabase
    .from('pvp_challenges')
    .select(`
      *,
      quests(*),
      opponent:student_profiles!pvp_challenges_opponent_id_fkey(id, level, users(username, display_name))
    `)
    .eq('id', id)
    .eq('challenger_id', profile.id)
    .single()

  if (!challenge) notFound()

  if (challenge.status === 'completed') {
    redirect('/murid/challenge')
  }

  return (
    <ChallengeBattleClient
      challenge={challenge}
      quest={challenge.quests}
      opponentName={(challenge.opponent as any)?.users?.display_name ?? (challenge.opponent as any)?.users?.username ?? 'Lawan'}
      playerName={(profile as any)?.users?.display_name ?? 'Alchemist'}
      playerLevel={profile.level}
    />
  )
}
