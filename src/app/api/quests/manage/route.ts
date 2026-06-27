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

// Soal raid boss mirip quiz, tapi pakai correct_index (bukan answer)
// dan punya field damage — konsisten dengan format yang dibaca
// PvEClient.tsx
const bossContentSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correct_index: z.number().int().min(0),
  explanation: z.string(),
  damage: z.number().int().min(1).max(100),
})

const raidBossMetaSchema = z.object({
  name: z.string().min(1),
  image_emoji: z.string().min(1),
  weakness: z.string().nullable().optional(),
  element: z.enum(['fire', 'water', 'earth', 'air', 'metal']),
  hp_max: z.number().int().min(1).default(100),
  hp_current: z.number().int().min(1).default(100),
})

const questSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  type: z.enum(['quiz', 'read', 'lab', 'mini_game', 'raid_boss']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().min(1),
  subtopic: z.string().nullable().optional(),
  xp_reward: z.number().int().min(0).max(10000),
  estimated_minutes: z.number().int().min(1).max(600),
  content: z.array(z.union([quizContentSchema, readContentSchema, labContentSchema, bossContentSchema])),
  is_published: z.boolean(),
  raid_boss: raidBossMetaSchema.optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'teacher' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Hanya guru yang bisa membuat quest' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = questSchema.parse(body)

    if (parsed.type === 'raid_boss' && !parsed.raid_boss) {
      return NextResponse.json({ error: 'Data boss (nama, emoji, elemen) wajib diisi untuk tipe Raid Boss' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('quests')
      .insert({
        ...parsed,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ quest: data })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 })
    }
    console.error('Create quest error:', err)
    return NextResponse.json({
    error: err instanceof Error ? err.message : String(err)
}, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: quests, error } = await supabase
      .from('quests')
      .select('id, title, description, type, difficulty, topic, xp_reward, is_published, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ quests })
  } catch (err) {
    console.error('List own quests error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
