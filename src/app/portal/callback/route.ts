import { NextResponse } from 'next/server'
import { createSessionCookie, verifyPortalToken } from '@/lib/portalAuth'

const APP_ID = 'case'
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || process.env.PORTAL_URL || 'http://localhost:3300'

function sanitizeRedirect(target: string | null, origin: string): string {
  if (!target) return '/'
  try {
    const url = new URL(target, origin)
    if (url.origin !== origin) return '/'
    return url.pathname + url.search + url.hash
  } catch {
    return target.startsWith('/') ? target : '/'
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('portalToken')
  const redirectTarget = sanitizeRedirect(url.searchParams.get('redirect'), url.origin)

  if (!token) {
    const portalLoginUrl = new URL('/login', PORTAL_URL)
    portalLoginUrl.searchParams.set('redirect', redirectTarget)
    return NextResponse.redirect(portalLoginUrl)
  }

  const payload = verifyPortalToken(token)
  if (!payload || payload.appId !== APP_ID) {
    const portalLoginUrl = new URL('/login', PORTAL_URL)
    portalLoginUrl.searchParams.set('redirect', redirectTarget)
    return NextResponse.redirect(portalLoginUrl)
  }

  const response = NextResponse.redirect(new URL(redirectTarget, url.origin))
  const sessionCookie = createSessionCookie(payload)
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options)
  return response
}
