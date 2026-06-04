import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import Providers from '@/components/layout/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Travio — Kişisel Seyahat Asistanın',
  description: 'Zevklerini öğrenen AI asistan. Sana özel seyahat planları, 30 saniyede.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={GeistSans.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
