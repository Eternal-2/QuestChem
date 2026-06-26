import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const submitSchema = z.object({
  score: z.number().min(0).max(100),
  xp_earned: z.number().min(0),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { score, xp_earned } = submitSchema.parse(body)

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

    // Verifikasi: hanya challenger pemilik challenge ini yang boleh submit
    const { data: challenge } = await supabase
      .from('pvp_challenges')
      .select('challenger_id, status')
      .eq('id', params.id)
      .single()

    if (!challenge) return NextResponse.json({ error: 'Challenge tidak ditemukan' }, { status: 404 })
    if (challenge.challenger_id !== profile.id) {
      return NextResponse.json({ error: 'Kamu tidak punya akses ke challenge ini' }, { status: 403 })
    }
    if (challenge.status === 'completed') {
      return NextResponse.json({ error: 'Challenge ini sudah diselesaikan' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('complete_challenge', {
      p_challenge_id: params.id,
      p_challenger_score: score,
      p_challenger_xp_earned: xp_earned,
    })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 })
    }
    console.error('Submit challenge error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
