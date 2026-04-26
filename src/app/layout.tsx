import type { Metadata } from 'next'
import './globals.css'

const BASE = 'https://climateminds.dk'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Climateminds — Sammenlign elselskaber i Danmark',
    template: '%s | Climateminds.dk',
  },
  description:
    'Find det billigste elselskab i Danmark. Vi sammenligner priser baseret på den aktuelle spotpris fra alle store udbydere.',
  keywords: [
    'billigste elselskab',
    'sammenlign elselskaber',
    'elpriser Danmark',
    'spotpris el',
    'grøn el Danmark',
    'billig el',
  ],
  alternates: { canonical: BASE },
  openGraph: {
    siteName: 'Climateminds.dk',
    locale: 'da_DK',
    type: 'website',
    url: BASE,
    title: 'Climateminds — Sammenlign elselskaber i Danmark',
    description:
      'Find det billigste elselskab i Danmark. Vi sammenligner priser baseret på den aktuelle spotpris fra alle store udbydere.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.webp', type: 'image/webp' }],
    apple: '/favicon.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
