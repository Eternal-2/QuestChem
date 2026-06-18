import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Cek role user di tabel users
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        // Kalau role teacher/admin → ke dashboard guru
        if (userData?.role === 'teacher' || userData?.role === 'admin') {
          return NextResponse.redirect(`${origin}/guru/home`)
        }

        // Kalau role student atau belum punya role → tolak, redirect ke halaman error
        return NextResponse.redirect(`${origin}/guru?error=not_teacher`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/guru?error=auth_failed`)
}
