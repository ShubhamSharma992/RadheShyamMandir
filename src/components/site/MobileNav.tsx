'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex h-11 w-11 items-center justify-center border border-bark/20"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
          {open ? (
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-[4.5rem] z-50 h-[calc(100dvh-4.5rem)] overflow-y-auto bg-whitewash shadow-lift">
          <nav aria-label="Main" className="shell flex flex-col divide-y divide-bark/10 py-2">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="py-4 font-display text-step-2 hover:text-sindoor">
                {item.label}
              </Link>
            ))}
            <Link href="/search" className="py-4 font-display text-step-2 hover:text-sindoor">
              Search
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
