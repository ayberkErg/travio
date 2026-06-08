import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Middleware sadece statik dosyaları filtreler
  // Auth kontrolü client tarafında Providers.tsx'deki onAuthStateChange ile yapılıyor
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
