import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Giriş yapmış kullanıcı login/register'a gitmesin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isConfigured = supabaseUrl && !supabaseUrl.includes('xxx') && supabaseKey && supabaseKey !== 'eyJ...'

  if (isConfigured && (pathname === '/auth/login' || pathname === '/auth/register')) {
    try {
      const { createServerClient } = await import('@supabase/ssr')
      let response = NextResponse.next({ request })
      const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      })
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch { /* devam et */ }
  }

  // Her şey açık — kullanıcı kayıt olmadan kullanabilir
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
