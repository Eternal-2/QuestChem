import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { join_code } = await request.json()
    if (!join_code) return NextResponse.json({ error: 'Kode kelas diperlukan' }, { status: 400 })

    // Parallel: cari kelas + ambil student profile sekaligus
    const [{ data: kelas }, { data: profile }] = await Promise.all([
      supabase
        .from('classes')
        .select('id, name')
        .eq('join_code', join_code.toUpperCase().trim())
        .single(),
      supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single(),
    ])

    if (!kelas) return NextResponse.json({ error: 'Kode kelas tidak ditemukan' }, { status: 404 })
    if (!profile) return NextResponse.json({ error: 'Profil siswa tidak ditemukan' }, { status: 404 })

    const { data: existing } = await supabase
      .from('class_members')
      .select('id')
      .eq('class_id', kelas.id)
      .eq('student_id', profile.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'Kamu sudah bergabung di kelas ini' }, { status: 409 })

    const { error: joinError } = await supabase
      .from('class_members')
      .insert({ class_id: kelas.id, student_id: profile.id })

    if (joinError) return NextResponse.json({ error: joinError.message }, { status: 500 })

    return NextResponse.json({ success: true, class_name: kelas.name })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
