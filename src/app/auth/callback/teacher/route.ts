import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login-guru?error=auth_failed`
    )
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/login-guru?error=auth_failed`
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login-guru?error=auth_failed`
    )
  }

  // Ambil data user dari database
  const { data: userData } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!userData) {
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      username:
        user.email?.split('@')[0] ??
        `teacher_${user.id.substring(0, 6)}`,
      display_name:
        user.user_metadata?.full_name ??
        user.email?.split('@')[0],
      avatar_url:
        user.user_metadata?.avatar_url ?? null,
      role: 'teacher',
    })

    await supabase.from('teacher_profiles').insert({
      user_id: user.id,
    })

    return NextResponse.redirect(`${origin}/guru/home`)
  }

  if (
    userData.role === 'teacher' ||
    userData.role === 'admin'
  ) {
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (!teacherProfile) {
      await supabase.from('teacher_profiles').insert({
        user_id: user.id,
      })
    }

    return NextResponse.redirect(`${origin}/guru/home`)
  }

  if (userData.role === 'student') {
    return NextResponse.redirect(
      `${origin}/login-guru?error=student_account`
    )
  }

  await supabase
    .from('users')
    .update({
      role: 'teacher',
    })
    .eq('id', user.id)

  const { data: teacherProfile } = await supabase
    .from('teacher_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!teacherProfile) {
    await supabase.from('teacher_profiles').insert({
      user_id: user.id,
    })
  }

  return NextResponse.redirect(`${origin}/guru/home`)
}