import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindBot',
  description: 'Your mental health support companion',
  generator: 'v0.dev',
  icons: {
    icon: '/download.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/download.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
