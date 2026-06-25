import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id, explosion_count')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil siswa tidak ditemukan' }, { status: 404 })

    const { data: experiments, error } = await supabase
      .from('lab_experiments')
      .select(`
        *,
        reagent_a:reagents!lab_experiments_reagent_a_id_fkey ( symbol, name, icon ),
        reagent_b:reagents!lab_experiments_reagent_b_id_fkey ( symbol, name, icon )
      `)
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      // Fallback: jika nama constraint FK berbeda di Supabase, ambil tanpa join eksplisit
      const fallback = await supabase
        .from('lab_experiments')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (fallback.error) throw fallback.error

      return NextResponse.json({
        experiments: fallback.data,
        explosion_count: profile.explosion_count,
      })
    }

    return NextResponse.json({
      experiments,
      explosion_count: profile.explosion_count,
    })
  } catch (err) {
    console.error('Fetch experiments error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
