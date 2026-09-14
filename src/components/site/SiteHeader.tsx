import Link from 'next/link'
import { getTempleInfo } from '@/lib/queries'
import { MobileNav } from './MobileNav'
import { SearchField } from './SearchField'

export const NAV = [
  { href: '/about', label: 'About the temple' },
  { href: '/events', label: 'Events' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export async function SiteHeader() {
  const temple = await getTempleInfo()

  return (
    <header className="sticky top-0 z-40 border-b border-bark/10 bg-whitewash/95 backdrop-blur">
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" className="group flex flex-col leading-none">
          {temple?.nameHi && (
            <span lang="hi" className="font-display text-[0.95rem] text-sindoor">
              {temple.nameHi}
            </span>
          )}
          <span className="font-display text-step-1 group-hover:text-sindoor">
            {temple?.name ?? 'Village Temple, Ratouli'}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-step--1 text-bark-soft transition-colors hover:text-sindoor"
            >
              {item.label}
            </Link>
          ))}
          <SearchField />
        </nav>

        <MobileNav items={NAV} />
      </div>
    </header>
  )
}
