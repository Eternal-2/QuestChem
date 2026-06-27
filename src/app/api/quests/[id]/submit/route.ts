import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const submitSchema = z.object({
  answers: z.array(z.number()),
  score: z.number().min(0).max(100),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { answers, score } = submitSchema.parse(body)

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

const { data, error } = await supabase.rpc('submit_quest', {
  p_student_id: profile.id,
  p_quest_id: id,
  p_answers: answers,
  p_score: score,
})

if (error) {
  console.error("SUPABASE RPC ERROR:", error)

  return NextResponse.json(
    {
      error,
    },
    { status: 500 }
  )
}

    return NextResponse.json(data)
} catch (err) {
  console.error("=== SUBMIT QUEST ERROR ===")
  console.error(err)

  if (err instanceof z.ZodError) {
    return NextResponse.json(
      { error: err.issues },
      { status: 400 }
    )
  }

  return NextResponse.json(
    {
      error: err instanceof Error ? err.message : String(err),
    },
    { status: 500 }
  )
}
}
