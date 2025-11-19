import { NextRequest, NextResponse } from 'next/server'
import { createStateToken } from '@/lib/linkedin'

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const REQUESTED_SCOPES = [
  'r_organization_social',
  'w_organization_social',
  'rw_organization_admin'
]

export async function GET(request: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'LinkedIn client ID or redirect URI not configured'
    }, { status: 500 })
  }

  const state = createStateToken()
  const url = new URL(LINKEDIN_AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', REQUESTED_SCOPES.join(' '))
  url.searchParams.set('state', state)

  const response = NextResponse.redirect(url.toString(), 302)
  response.cookies.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60
  })
  return response
}
