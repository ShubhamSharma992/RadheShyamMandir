import type { Metadata, Viewport } from 'next'
import { Halant, Mukta } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { getTempleInfo } from '@/lib/queries'

/**
 * Both faces cover Devanagari and Latin, so Hindi and English lines sit on
 * the same baseline instead of one falling back to a system face.
 */
const display = Halant({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
})

const body = Mukta({
  subsets: ['latin', 'devanagari'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const temple = await getTempleInfo()
  const name = temple?.name ?? 'Village Temple, Ratouli'
  const place = 'Village Ratouli, Yamunanagar, Haryana'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${name} — ${place}`, template: `%s · ${name}` },
    description:
      temple?.tagline ??
      `Darshan timings, festivals, events and photographs from the temple at ${place}.`,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: name,
      images: temple?.heroImageUrl ? [temple.heroImageUrl] : [],
    },
    alternates: { canonical: '/' },
  }
}

export const viewport: Viewport = {
  themeColor: '#F2F4EE',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                     focus:bg-sindoor focus:px-4 focus:py-2 focus:text-whitewash"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
