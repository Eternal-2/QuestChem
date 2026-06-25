import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, { ...options, path: '/' })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Selalu bypass auth callback
  if (pathname.startsWith('/auth/')) return supabaseResponse

  const publicRoutes = ['/', '/login', '/register', '/login-guru']
  const isPublic = publicRoutes.some(r => pathname === r)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // ✅ OPTIMASI: Baca role dari user_metadata — 0 query DB
    const role = user.user_metadata?.role as string | undefined

    // Kalau belum ada role di metadata, fallback query DB sekali
    let resolvedRole = role
    if (!resolvedRole) {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      resolvedRole = data?.role
    }

    // Redirect dari halaman auth kalau sudah login
    if (pathname === '/login' || pathname === '/register' || pathname === '/login-guru') {
      if (resolvedRole === 'teacher' || resolvedRole === 'admin') {
        return NextResponse.redirect(new URL('/guru/home', request.url))
      }
      return NextResponse.redirect(new URL('/murid/home', request.url))
    }

    // Proteksi route guru
    if (pathname.startsWith('/guru') && resolvedRole !== 'teacher' && resolvedRole !== 'admin') {
      return NextResponse.redirect(new URL('/murid/home', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
