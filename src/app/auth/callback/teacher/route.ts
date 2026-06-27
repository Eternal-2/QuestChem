import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login-guru?error=auth_failed`)
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error(error)
    return NextResponse.redirect(`${origin}/login-guru?error=auth_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.redirect(`${origin}/login-guru?error=auth_failed`)
  }

  // ============================
  // Cek apakah email guru terdaftar
  // ============================
  const { data: allowedTeacher } = await supabase
    .from('teacher_allowlist')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()

  if (!allowedTeacher) {
    await supabase.auth.signOut()

    return NextResponse.redirect(
      `${origin}/login-guru?error=not_teacher`
    )
  }

  // ============================
  // Buat / update user sebagai teacher
  // ============================
  const { error: userError } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email,
        username:
          user.email.split('@')[0],
        display_name:
          user.user_metadata?.full_name ??
          user.email.split('@')[0],
        avatar_url:
          user.user_metadata?.avatar_url ?? null,
        role: 'teacher',
      },
      {
        onConflict: 'id',
      }
    )

  if (userError) {
    console.error(userError)

    return NextResponse.redirect(
      `${origin}/login-guru?error=database`
    )
  }

  // ============================
  // Pastikan teacher profile ada
  // ============================
  await supabase
    .from('teacher_profiles')
    .upsert(
      {
        user_id: user.id,
      },
      {
        onConflict: 'user_id',
      }
    )

  return NextResponse.redirect(`${origin}/guru/home`)
}