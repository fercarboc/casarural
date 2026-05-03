// Toda la app es dinámica — requiere sesión de Supabase en runtime, no SSG.
export const dynamic = 'force-dynamic'

import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { RegisterSW } from '@/components/register-sw'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Rasilla · Admin',
  description: 'Panel de administración de Casa Rural La Rasilla',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',

  // iOS Safari PWA
  appleWebApp: {
    capable: true,
    title: 'La Rasilla',
    statusBarStyle: 'default',
  },

  // Iconos
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },

  // Open Graph — por si alguien comparte el enlace
  openGraph: {
    title: 'La Rasilla · Admin',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',      // safe-area en iPhone con notch
  themeColor: '#1a3a2a',     // verde oscuro del logo — barra de estado Android + Safari
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${geist.className} antialiased bg-background`}>
        {children}
        <RegisterSW />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
