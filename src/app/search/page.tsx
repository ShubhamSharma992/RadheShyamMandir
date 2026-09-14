import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { searchEverything } from '@/lib/queries'
import { PageHeader } from '@/components/site/PageHeader'
import { SearchField } from '@/components/site/SearchField'
import { formatDate, formatDateRange, truncate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Search', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim()
  const results = q.length > 1 ? await searchEverything(q) : null
  const total = results
    ? results.events.length + results.announcements.length + results.media.length + results.videos.length
    : 0

  return (
    <>
      <PageHeader title="Search" titleHi="खोजें" />

      <div className="shell py-12">
        <div className="max-w-2xl">
          <SearchField initial={q} big />
        </div>

        {!results && (
          <p className="mt-8 text-bark-muted">
            Search for an event, a notice, a photograph or a video. Type at least two characters.
          </p>
        )}

        {results && total === 0 && (
          <p className="mt-8 text-bark-soft">
            Nothing matched “{q}”. Try a shorter word, or browse{' '}
            <Link href="/events" className="link-underline">
              all events
            </Link>
            .
          </p>
        )}

        {results && total > 0 && (
          <div className="mt-10 space-y-14">
            <p className="text-step--1 text-bark-muted">
              {total} {total === 1 ? 'result' : 'results'} for “{q}”
            </p>

            {results.events.length > 0 && (
              <section>
                <h2 className="mb-5 text-step-2">Events</h2>
                <ul className="divide-y divide-bark/10 border-y border-bark/15">
                  {results.events.map((event) => (
                    <li key={event.id}>
                      <Link href={`/events/${event.slug}`} className="block py-5 hover:text-sindoor">
                        <span className="font-display text-step-1">{event.title}</span>
                        <span className="mt-1 block text-step--1 text-bark-muted">
                          {formatDateRange(event.startDate, event.endDate)} · {event.location}
                        </span>
                        {event.summary && (
                          <span className="mt-1 block text-step--1 text-bark-soft">{truncate(event.summary, 140)}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.announcements.length > 0 && (
              <section>
                <h2 className="mb-5 text-step-2">Notices</h2>
                <ul className="divide-y divide-bark/10 border-y border-bark/15">
                  {results.announcements.map((item) => (
                    <li key={item.id} className="py-5">
                      <p className="font-display text-step-1">{item.title}</p>
                      <p className="mt-1 text-step--1 text-bark-soft">{truncate(item.body, 180)}</p>
                      <p className="mt-1 text-step--1 text-bark-muted">{formatDate(item.startsAt)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.videos.length > 0 && (
              <section>
                <h2 className="mb-5 text-step-2">Videos</h2>
                <ul className="divide-y divide-bark/10 border-y border-bark/15">
                  {results.videos.map((video) => (
                    <li key={video.id} className="py-5">
                      <Link href="/gallery?type=videos" className="font-display text-step-1 hover:text-sindoor">
                        {video.title}
                      </Link>
                      {video.description && (
                        <p className="mt-1 text-step--1 text-bark-soft">{truncate(video.description, 140)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.media.length > 0 && (
              <section>
                <h2 className="mb-5 text-step-2">Photographs</h2>
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {results.media.map((image) => (
                    <li key={image.id}>
                      <Link href="/gallery" className="block aspect-square overflow-hidden bg-parchment">
                        <Image
                          src={image.thumbnailUrl ?? image.url}
                          alt={image.altText ?? ''}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      {image.title && <p className="mt-2 text-step--1 text-bark-muted">{image.title}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}
