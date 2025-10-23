import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionCookieName } from '@/lib/sessionCookie'
import { decodeSessionCookie } from '@/lib/portalAuth'

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || process.env.PORTAL_URL || 'http://localhost:3001'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const sessionCookie = cookies().get(getSessionCookieName())
  if (!sessionCookie) {
    const loginUrl = new URL('/login', PORTAL_URL)
    loginUrl.searchParams.set('redirect', '/')
    redirect(loginUrl.toString())
  }

  const session = decodeSessionCookie(sessionCookie.value)
  const displayName = session?.displayName ?? 'UCtel teammate'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-uctel-secondary">UCtel Internal</p>
            <h1 className="text-lg font-semibold text-uctel-primary">Case Study Generator</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden sm:inline">Signed in as {displayName}</span>
            <a
              href="/logout"
              className="rounded-md border border-uctel-secondary px-3 py-1.5 font-medium text-uctel-secondary transition hover:bg-uctel-secondary hover:text-white"
            >
              Sign out
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">{children}</main>
    </div>
  )
}
