import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  reagent_a_id: z.string().uuid(),
  reagent_b_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { reagent_a_id, reagent_b_id, notes } = schema.parse(body)

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil siswa tidak ditemukan' }, { status: 404 })

    const { data, error } = await supabase.rpc('run_lab_experiment', {
      p_student_id: profile.id,
      p_reagent_a_id: reagent_a_id,
      p_reagent_b_id: reagent_b_id,
      p_notes: notes ?? null,
    })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    console.error('Lab experiment error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
