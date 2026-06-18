import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // ✅ FIX Bug #2: buat NextResponse baru SEKALI, bukan di dalam loop
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
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

  // ✅ FIX Bug #1: /auth/callback HARUS diexclude, jangan disentuh middleware
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse
  }

  // 1. UBAH BAGIAN INI: Hapus /guru, ganti jadi /login-guru
  const publicRoutes = ['/', '/login', '/register', '/login-guru']
  const isPublic = publicRoutes.some(route => pathname === route)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. UBAH BAGIAN INI: Tambahkan /login-guru agar kalau sudah login, tidak bisa buka halaman login lagi
  if (user && (pathname === '/login' || pathname === '/register' || pathname === '/login-guru')) {
    return NextResponse.redirect(new URL('/murid/home', request.url))
  }

  // Role-based protection
  if (user) {
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!error && userData) {
      const role = userData.role
      if (pathname.startsWith('/guru') && role !== 'teacher' && role !== 'admin') {
        return NextResponse.redirect(new URL('/murid/home', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}