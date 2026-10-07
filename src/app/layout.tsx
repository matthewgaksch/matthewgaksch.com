import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { site } from '../content/site'
import { pages } from '../content/pages'
import '../styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: { default: pages.home.title, template: `%s — ${site.name}` },
  description: pages.home.description,
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: pages.home.title,
    description: 'Building software, infrastructure, and products from Thailand.',
    url: '/',
    images: ['/og-image.png'],
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#08080b' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
