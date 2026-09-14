import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCategories, todayIST } from '@/lib/queries'
import { EventCard } from '@/components/site/EventCard'
import { PageHeader } from '@/components/site/PageHeader'
import { Empty } from '@/components/ui/Empty'
import { cn } from '@/lib/utils'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Events',
  description: 'Puja, festivals, bhandara and community gatherings at the temple in Ratouli.',
}

const PER_PAGE = 9

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { when?: string; category?: string; page?: string }
}) {
  const past = searchParams.when === 'past'
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const categorySlug = searchParams.category

  const where = {
    status: 'PUBLISHED' as const,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(past ? { startDate: { lt: todayIST() } } : { startDate: { gte: todayIST() } }),
  }

  const [events, total, categories] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: past ? { startDate: 'desc' } : { startDate: 'asc' },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      select: {
        id: true, title: true, titleHi: true, slug: true, summary: true,
        startDate: true, endDate: true, startTime: true, endTime: true, allDay: true,
        location: true, isFeatured: true,
        category: { select: { name: true, slug: true, color: true } },
        coverImage: { select: { url: true, thumbnailUrl: true, altText: true } },
      },
    }),
    prisma.event.count({ where }),
    getCategories(),
  ])

  const pages = Math.ceil(total / PER_PAGE)
  const base = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v)
    const qs = sp.toString()
    return `/events${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <PageHeader
        title="Events"
        titleHi="कार्यक्रम"
        intro="Everything the committee has scheduled, from daily aarti to the year's biggest festivals."
      />

      <div className="shell py-12">
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-bark/15 pb-5">
          <div className="flex gap-4">
            <Link
              href={base({ category: categorySlug })}
              className={cn('text-step--1', !past ? 'text-sindoor underline decoration-brass underline-offset-4' : 'text-bark-soft hover:text-sindoor')}
            >
              Upcoming
            </Link>
            <Link
              href={base({ when: 'past', category: categorySlug })}
              className={cn('text-step--1', past ? 'text-sindoor underline decoration-brass underline-offset-4' : 'text-bark-soft hover:text-sindoor')}
            >
              Past events
            </Link>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Link
                href={base({ when: past ? 'past' : undefined })}
                className={cn(
                  'border px-3 py-1.5 text-step--1 transition-colors',
                  !categorySlug ? 'border-bark bg-bark text-whitewash' : 'border-bark/20 text-bark-soft hover:border-bark/60',
                )}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={base({ when: past ? 'past' : undefined, category: c.slug })}
                  className={cn(
                    'flex items-center gap-2 border px-3 py-1.5 text-step--1 transition-colors',
                    categorySlug === c.slug ? 'border-bark bg-bark text-whitewash' : 'border-bark/20 text-bark-soft hover:border-bark/60',
                  )}
                >
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {events.length === 0 ? (
          <Empty
            title={past ? 'No past events recorded' : 'Nothing scheduled just yet'}
            body={
              past
                ? 'Past events appear here once they have been held.'
                : 'Check the calendar, or come back after the next committee meeting.'
            }
            action={{ href: '/calendar', label: 'Open the calendar' }}
          />
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} priority={i < 3} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={base({ when: past ? 'past' : undefined, category: categorySlug, page: String(n) })}
                aria-current={n === page ? 'page' : undefined}
                className={cn(
                  'flex h-10 w-10 items-center justify-center text-step--1 tabular-nums',
                  n === page ? 'bg-bark text-whitewash' : 'text-bark-soft hover:bg-bark/5',
                )}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  )
}
