// POST /api/ai-tutor — Professor Nova AI chat (Gemini)
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

    // Get chat history (last 10 messages)
    const { data: history } = await supabase
      .from('ai_chat_logs')
      .select('role, message')
      .eq('student_id', profile.id)
      .eq('session_id', session_id ?? '')
      .order('created_at', { ascending: true })
      .limit(10)

    const systemPrompt = `Kamu adalah Professor Nova, tutor kimia yang ramah dan menyemangati di QuestChem — platform belajar kimia berbasis gamifikasi.
Siswa ini berada di Level ${profile.level ?? 1} dengan tingkat pengetahuan kimia: ${profile.chemistry_knowledge_level ?? 'pemula'}.
Tugasmu: jelaskan konsep kimia dengan jelas, beri petunjuk tanpa langsung memberi jawaban, rayakan kemajuan siswa, dan jaga semangat belajar mereka.
Selalu jawab dalam Bahasa Indonesia kecuali siswa bertanya dalam bahasa lain.
Jawaban singkat dan padat (2-4 kalimat) kecuali menjelaskan konsep kompleks.
Konteks topik: ${topic ?? 'kimia umum'}.`

    // Build Gemini conversation history
    const geminiHistory = history?.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.message }],
    })) ?? []

    let aiResponse = "Halo! Aku Professor Nova! Aku akan segera aktif penuh. Untuk sekarang, terus latih quest kimiamu ya! 🧪"

    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      })

      const chat = model.startChat({
        history: geminiHistory,
      })

      const result = await chat.sendMessage(message)
      aiResponse = result.response.text()
    }

    // Simpan ke DB
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
    console.error('AI Tutor error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
