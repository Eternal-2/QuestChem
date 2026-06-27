import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error(error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Cek apakah user sudah ada
  const { data: existingUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Kalau belum ada, buat sebagai student
  if (!existingUser) {
    const { error: userError } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          username:
            user.email?.split('@')[0] ??
            `student_${user.id.substring(0, 6)}`,
          display_name:
            user.user_metadata?.full_name ??
            user.email?.split('@')[0],
          avatar_url:
            user.user_metadata?.avatar_url ?? null,
          role: 'student',
        },
        {
          onConflict: 'id',
        }
      )

    if (userError) {
      console.error(userError)
      return NextResponse.redirect(`${origin}/login?error=database`)
    }

    await supabase
      .from('student_profiles')
      .upsert(
        {
          user_id: user.id,
          level: 1,
          xp: 0,
          xp_to_next_level: 1000,
          title: 'Novice Chemist',
          streak_days: 0,
          chemistry_knowledge_level: 1,
          reaction_mastery_level: 1,
          safety_protocol_level: 1,
        },
        {
          onConflict: 'user_id',
        }
      )

    return NextResponse.redirect(`${origin}/murid/home`)
  }

  // Kalau sudah teacher
  if (
    existingUser.role === 'teacher' ||
    existingUser.role === 'admin'
  ) {
    return NextResponse.redirect(`${origin}/guru/home`)
  }

  // Pastikan student profile ada
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!studentProfile) {
    await supabase
      .from('student_profiles')
      .upsert(
        {
          user_id: user.id,
          level: 1,
          xp: 0,
          xp_to_next_level: 1000,
          title: 'Novice Chemist',
          streak_days: 0,
          chemistry_knowledge_level: 1,
          reaction_mastery_level: 1,
          safety_protocol_level: 1,
        },
        {
          onConflict: 'user_id',
        }
      )
  }

  return NextResponse.redirect(`${origin}/murid/home`)
}