import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UCtel Case Study Generator',
  description: 'Generate professional case studies with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
