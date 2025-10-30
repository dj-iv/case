import { NextResponse } from 'next/server'
import { getSessionCookieName } from '@/lib/sessionCookie'

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || process.env.PORTAL_URL || 'http://localhost:3300'

function buildPortalLoginUrl(targetHref: string): URL {
  const portalUrl = new URL('/login', PORTAL_URL)
  portalUrl.searchParams.set('redirect', targetHref)
  return portalUrl
}

export function GET(request: Request) {
  const redirectTarget = request.headers.get('referer') ?? new URL('/', request.url).href
  const portalLoginUrl = buildPortalLoginUrl(redirectTarget)
  const response = NextResponse.redirect(portalLoginUrl)
  response.cookies.delete(getSessionCookieName())
  return response
}

export function POST(request: Request) {
  const redirectTarget = request.headers.get('referer') ?? new URL('/', request.url).href
  const portalLoginUrl = buildPortalLoginUrl(redirectTarget)
  const response = NextResponse.json({ success: true, redirect: portalLoginUrl.toString() })
  response.cookies.delete(getSessionCookieName())
  return response
}
