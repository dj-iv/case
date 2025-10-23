import crypto from 'crypto'
import { Buffer } from 'node:buffer'
import { SESSION_COOKIE, getSessionCookieName } from './sessionCookie'

function getSecret(): string {
  const secret = process.env.PORTAL_SIGNING_SECRET
  if (!secret) {
    throw new Error('PORTAL_SIGNING_SECRET must be configured')
  }
  return secret
}
const SESSION_DURATION_SECONDS = 60 * 60 * 5 // 5 hours

export interface PortalLaunchPayload {
  uid: string
  appId: string
  exp: number
  email?: string | null
  displayName?: string | null
}

function normaliseLaunchPayload(payload: PortalLaunchPayload): PortalLaunchPayload {
  return {
    uid: payload.uid,
    appId: payload.appId,
    exp: payload.exp,
    email: payload.email ?? null,
    displayName: payload.displayName ?? null,
  }
}

export function verifyPortalToken(token: string): PortalLaunchPayload | null {
  const [data, signature] = token.split('.')
  if (!data || !signature) return null

  const expectedSignature = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (providedBuffer.length !== expectedBuffer.length) return null
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null

  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString()) as PortalLaunchPayload
    if (!parsed || typeof parsed.uid !== 'string' || typeof parsed.appId !== 'string' || typeof parsed.exp !== 'number') {
      return null
    }
    if (parsed.exp < Date.now()) return null
    return normaliseLaunchPayload(parsed)
  } catch {
    return null
  }
}

type SessionValueInput = string | PortalLaunchPayload

interface SessionCookiePayload {
  uid: string
  email: string | null
  displayName: string | null
}

function serialiseSessionPayload(value: SessionValueInput): string {
  if (typeof value === 'string') {
    const payload: SessionCookiePayload = {
      uid: value,
      email: null,
      displayName: null,
    }
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  }

  const payload = normaliseLaunchPayload(value)
  const cookiePayload: SessionCookiePayload = {
    uid: payload.uid,
    email: payload.email ?? null,
    displayName: payload.displayName ?? null,
  }
  return Buffer.from(JSON.stringify(cookiePayload), 'utf8').toString('base64url')
}

export function createSessionCookie(value: SessionValueInput) {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || process.env.PORTAL_URL
  const secure = portalUrl ? portalUrl.startsWith('https://') : process.env.NODE_ENV === 'production'
  return {
    name: SESSION_COOKIE,
    value: serialiseSessionPayload(value),
    options: {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    },
  }
}

export function decodeSessionCookie(value: string | undefined): SessionCookiePayload | null {
  if (!value) {
    return null
  }

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as Partial<SessionCookiePayload>
    if (!parsed || typeof parsed.uid !== 'string') {
      return null
    }
    return {
      uid: parsed.uid,
      email: typeof parsed.email === 'string' ? parsed.email : null,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : null,
    }
  } catch {
    return {
      uid: value,
      email: null,
      displayName: null,
    }
  }
}

export { getSessionCookieName }
