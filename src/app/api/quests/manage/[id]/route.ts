import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const quizContentSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().min(0),
  explanation: z.string(),
})

const readContentSchema = z.object({
  section: z.string().min(1),
  content: z.string().min(1),
})

const labContentSchema = z.object({
  step: z.number().int(),
  instruction: z.string().min(1),
  expected: z.string(),
})

const questUpdateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  type: z.enum(['quiz', 'read', 'lab', 'mini_game']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().min(1),
  subtopic: z.string().nullable().optional(),
  xp_reward: z.number().int().min(0).max(10000),
  estimated_minutes: z.number().int().min(1).max(600),
  content: z.array(z.union([quizContentSchema, readContentSchema, labContentSchema])),
  is_published: z.boolean(),
})

async function verifyOwnership(supabase: any, userId: string, questId: string) {
  const { data: quest } = await supabase
    .from('quests')
    .select('id, created_by')
    .eq('id', questId)
    .single()

  return quest && quest.created_by === userId
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await verifyOwnership(supabase, user.id, id)
    if (!isOwner) {
      return NextResponse.json({ error: 'Kamu tidak punya akses untuk mengubah quest ini' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = questUpdateSchema.parse(body)

    const { data, error } = await supabase
      .from('quests')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ quest: data })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 })
    }
    console.error('Update quest error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await verifyOwnership(supabase, user.id, id)
    if (!isOwner) {
      return NextResponse.json({ error: 'Kamu tidak punya akses untuk menghapus quest ini' }, { status: 403 })
    }

    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete quest error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
