import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              path: '/',
            })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Biarkan callback auth berjalan sendiri
  if (pathname.startsWith('/auth/')) {
    return response
  }

  // Route yang boleh diakses tanpa login
  const publicRoutes = [
    '/',
    '/login',
    '/login-guru',
    '/register',
  ]

  const isPublic = publicRoutes.includes(pathname)

  if (!user && !isPublic) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  if (!user) {
    return response
  }

  // Ambil role dari database
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Jika user belum ada di database
  if (!dbUser) {
    return response
  }

  const role = dbUser.role

  // Jika sudah login lalu membuka halaman login
  if (
    pathname === '/login' ||
    pathname === '/login-guru' ||
    pathname === '/register'
  ) {
    if (role === 'teacher') {
      return NextResponse.redirect(
        new URL('/guru/home', request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/murid/home', request.url)
    )
  }

  // Proteksi halaman guru
  if (
    pathname.startsWith('/guru') &&
    role !== 'teacher'
  ) {
    return NextResponse.redirect(
      new URL('/murid/home', request.url)
    )
  }

  // Proteksi halaman murid
  if (
    pathname.startsWith('/murid') &&
    role === 'teacher'
  ) {
    return NextResponse.redirect(
      new URL('/guru/home', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}