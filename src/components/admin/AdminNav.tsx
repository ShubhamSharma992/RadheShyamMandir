'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/gallery', label: 'Photos and videos' },
  { href: '/admin/temple', label: 'Temple information' },
  { href: '/admin/messages', label: 'Messages' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="mt-8 flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-y-1">
      {LINKS.map((link) => {
        const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'py-1.5 text-step--1 transition-colors',
              active ? 'text-sindoor' : 'text-bark-soft hover:text-sindoor',
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
