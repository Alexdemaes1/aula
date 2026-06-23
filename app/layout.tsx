import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  try {
    if (raw) return new URL(raw)
  } catch {}
  return new URL('https://aula-kappa-nine.vercel.app')
}

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: 'Tian Ying Fa — Tai Ji, Qi Gong y Medicina Natural',
    template: '%s | Tian Ying Fa',
  },
  description:
    'Centro Tian Ying Fa — cursos online de Tai Ji Quan, Qi Gong, meditación y medicina natural con el Sifu Salvador Montiel. Más de 25 años de experiencia en Algemesí, Valencia.',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Tian Ying Fa',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
