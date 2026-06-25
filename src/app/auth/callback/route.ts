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
        let { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        // Auto-insert kalau belum ada
        if (!userData) {
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
            level: 1, xp: 0, xp_to_next_level: 1000,
            title: 'Novice Chemist', streak_days: 0,
            chemistry_knowledge_level: 1,
            reaction_mastery_level: 1,
            safety_protocol_level: 1,
          }, { onConflict: 'user_id' })

          userData = { role: 'student' }
        }

        // Redirect berdasarkan role
        if (userData.role === 'teacher' || userData.role === 'admin') {
          return NextResponse.redirect(`${origin}/guru/home`)
        }
        return NextResponse.redirect(`${origin}/murid/home`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}