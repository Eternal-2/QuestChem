import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createSchema = z.object({
  opponent_id: z.string().uuid(),
  quest_id: z.string().uuid(),
})

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    // Challenge di mana aku jadi penantang ATAU jadi target
    const { data: challenges, error } = await supabase
      .from('pvp_challenges')
      .select(`
        *,
        quests(id, title, type, xp_reward),
        challenger:student_profiles!pvp_challenges_challenger_id_fkey(id, level, users(username, display_name)),
        opponent:student_profiles!pvp_challenges_opponent_id_fkey(id, level, users(username, display_name))
      `)
      .or(`challenger_id.eq.${profile.id},opponent_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ challenges, myStudentId: profile.id })
  } catch (err) {
    console.error('List challenges error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { opponent_id, quest_id } = createSchema.parse(body)

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    const { data, error } = await supabase.rpc('create_challenge', {
      p_challenger_id: profile.id,
      p_opponent_id: opponent_id,
      p_quest_id: quest_id,
    })

    if (error) throw error
    if (!data.success) return NextResponse.json({ error: data.error }, { status: 400 })

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 })
    }
    console.error('Create challenge error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
