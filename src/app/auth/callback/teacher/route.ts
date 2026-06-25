import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = userData?.role

        if (role === 'teacher' || role === 'admin') {
          return NextResponse.redirect(`${origin}/guru/home`)
        }

        if (role === 'student') {
          return NextResponse.redirect(`${origin}/murid/home`)
        }

        // ✅ Role null = user baru atau data terhapus → auto insert sebagai student
        if (!role) {
          await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name ?? user.email?.split('@')[0],
            username: user.email?.split('@')[0],
            role: 'student',
            avatar_url: user.user_metadata?.avatar_url ?? null,
          }, { onConflict: 'id' })

          await supabase.from('student_profiles').upsert({
            user_id: user.id,
            level: 1,
            xp: 0,
            xp_to_next_level: 1000,
            title: 'Novice Chemist',
            streak_days: 0,
            chemistry_knowledge_level: 1,
            reaction_mastery_level: 1,
            safety_protocol_level: 1,
          }, { onConflict: 'user_id' })

          return NextResponse.redirect(`${origin}/murid/home`)
        }

        return NextResponse.redirect(`${origin}/login-guru?error=not_teacher`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login-guru?error=auth_failed`)
}