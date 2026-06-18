// POST /api/xp — award XP manually (login streak, special events)
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  amount:      z.number().min(1).max(10000),
  source:      z.string(),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { amount, source, description } = schema.parse(body)

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { data, error } = await supabase.rpc('award_xp', {
      p_student_id:  profile.id,
      p_amount:      amount,
      p_source:      source,
      p_description: description ?? null,
    })

    if (error) throw error

    // Update streak
    await supabase.rpc('update_streak', { p_student_id: profile.id })

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
