import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Climateminds — Sammenlign elselskaber i Danmark',
    template: '%s | Climateminds.dk',
  },
  description: 'Find det billigste elselskab i Danmark. Vi sammenligner priser baseret på den aktuelle spotpris fra alle store udbydere.',
  alternates: { canonical: 'https://climateminds.dk' },
  icons: { icon: [{ url: '/favicon.png', type: 'image/png' }] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
