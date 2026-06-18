// POST /api/ai-tutor — Professor Nova AI chat
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  message:    z.string().min(1).max(2000),
  session_id: z.string().uuid().optional(),
  topic:      z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { message, session_id, topic } = schema.parse(body)

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id, level, chemistry_knowledge_level')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Get chat history for context (last 10 messages)
    const { data: history } = await supabase
      .from('ai_chat_logs')
      .select('role, message')
      .eq('student_id', profile.id)
      .eq('session_id', session_id ?? '')
      .order('created_at', { ascending: true })
      .limit(10)

    // Build messages for OpenAI
    const systemPrompt = `You are Professor Nova, a friendly and encouraging chemistry tutor in QuestChem — a gamified chemistry learning platform. 
The student is Level ${profile.level} with Chemistry Knowledge Level ${profile.chemistry_knowledge_level}.
Your role: explain chemistry concepts clearly, give hints without spoiling answers, celebrate progress, and keep the student motivated.
Always respond in the language the student uses. Keep responses concise (2-4 sentences max unless explaining a complex concept).
Topic context: ${topic ?? 'general chemistry'}.`

    const messages = [
      ...(history?.map(h => ({ role: h.role as 'user' | 'assistant', content: h.message })) ?? []),
      { role: 'user' as const, content: message },
    ]

    // Call OpenAI (Fase 2: uncomment when API key is set)
    let aiResponse = "I'm Professor Nova! I'll be fully operational soon. For now, keep practicing your chemistry quests! 🧪"

    if (process.env.OPENAI_API_KEY) {
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 300,
      })
      aiResponse = completion.choices[0].message.content ?? aiResponse
    }

    // Save both messages to DB
    const sid = session_id ?? crypto.randomUUID()
    await supabase.from('ai_chat_logs').insert([
      { student_id: profile.id, session_id: sid, role: 'user',      message, topic },
      { student_id: profile.id, session_id: sid, role: 'assistant', message: aiResponse, topic },
    ])

    return NextResponse.json({ response: aiResponse, session_id: sid })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
