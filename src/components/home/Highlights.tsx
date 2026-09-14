import Link from 'next/link'
import { ArchDivider } from '@/components/ui/Arch'

/**
 * Signposts, not marketing tiles — each one answers a question a visitor
 * actually arrives with.
 */
const HIGHLIGHTS = [
  { href: '/contact#timings', title: 'Daily darshan', titleHi: 'दैनिक दर्शन', body: 'Aarti and darshan timings through the week.' },
  { href: '/events?category=festival', title: 'Festivals', titleHi: 'त्योहार', body: 'How the village marks the year, and what to expect.' },
  { href: '/about#history', title: 'Temple history', titleHi: 'मंदिर का इतिहास', body: 'How the temple came to stand where it does.' },
  { href: '/about#community', title: 'Community', titleHi: 'समुदाय', body: 'The families and seva that keep the temple running.' },
  { href: '/calendar', title: 'Calendar', titleHi: 'पंचांग', body: 'Every scheduled event, month by month.' },
  { href: '/gallery', title: 'Gallery', titleHi: 'चित्रशाला', body: 'Photographs and videos from recent gatherings.' },
]

export function Highlights() {
  return (
    <section className="section">
      <div className="shell">
        <ArchDivider className="mb-12" />
        <ul className="grid gap-px border border-bark/10 bg-bark/10 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <li key={item.href} className="bg-whitewash">
              <Link
                href={item.href}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-brass-tint"
              >
                <span lang="hi" className="font-display text-step-0 text-sindoor">
                  {item.titleHi}
                </span>
                <span className="font-display text-step-2 group-hover:text-sindoor">{item.title}</span>
                <span className="mt-2 text-step--1 text-bark-soft">{item.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
