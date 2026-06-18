// GET /api/quests — list quests with student progress
// POST /api/quests/[id]/submit — submit quest answers
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const topic = searchParams.get('topic')
    const type = searchParams.get('type')

    // Get student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Build quest query
    let query = supabase
      .from('quests')
      .select('*')
      .eq('is_published', true)
      .order('xp_reward', { ascending: true })

    if (topic) query = query.eq('topic', topic)
    if (type)  query = query.eq('type', type)

    const { data: quests, error } = await query
    if (error) throw error

    // Get student progress for these quests
    let studentQuests: Record<string, unknown> = {}
    if (profile) {
      const { data: sq } = await supabase
        .from('student_quests')
        .select('quest_id, status, score, xp_earned, attempts')
        .eq('student_id', profile.id)

      sq?.forEach(item => {
        studentQuests[item.quest_id] = item
      })
    }

    // Merge progress into quests
    const questsWithProgress = quests?.map(q => ({
      ...q,
      progress: studentQuests[q.id] ?? { status: 'locked' },
    }))

    return NextResponse.json({ quests: questsWithProgress })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
