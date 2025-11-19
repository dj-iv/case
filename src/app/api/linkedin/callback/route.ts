import { NextRequest, NextResponse } from 'next/server'
import { exchangeAuthorizationCode } from '@/lib/linkedin'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = request.cookies.get('linkedin_oauth_state')?.value

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json({ error: 'State mismatch. Please start the LinkedIn connection again.' }, { status: 400 })
  }

  try {
    const tokens = await exchangeAuthorizationCode(code)
    const response = NextResponse.json({
      success: true,
      message: 'Copy the refresh token below into LINKEDIN_REFRESH_TOKEN inside .env.local before restarting the dev server.',
      tokens
    })
    response.cookies.set('linkedin_oauth_state', '', { expires: new Date(0), path: '/' })
    return response
  } catch (error) {
    console.error('LinkedIn callback error:', error)
    return NextResponse.json({
      error: 'LinkedIn authorization failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
