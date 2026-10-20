import { NextResponse, type NextRequest } from 'next/server'

export const SESSION_COOKIE = 'team4_session'

const AUTH_PAGES = new Set(['/sign-in', '/sign-up'])

// Public pages are accessible with or without a session.
// The backend validates the session when account data is requested.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE)
  const onAuthPage = AUTH_PAGES.has(request.nextUrl.pathname)

  if (hasSession && onAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/|capture/|_next/|favicon\\.ico$|icon\\.svg$).*)'],
}
