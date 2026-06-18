import { NextResponse } from 'next/server'
// Pastikan path import ini benar sesuai letak file server.ts Anda
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/murid/home'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Arahkan ke /home, biarkan middleware yang menentukan apakah dia boleh masuk atau tidak
      return NextResponse.redirect(`${origin}/murid/home`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}