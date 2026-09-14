import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getEventBySlug } from '@/lib/queries'
import { GalleryGrid } from '@/components/site/Lightbox'
import { VideoGrid } from '@/components/site/VideoPlayer'
import { ArchDivider } from '@/components/ui/Arch'
import { ShareButton } from '@/components/site/ShareButton'
import { formatDateRange, formatTimeRange, truncate } from '@/lib/utils'

export const revalidate = 900

export async function generateStaticParams() {
  const events = await prisma.event.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true }, take: 100 })
  return events.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEventBySlug(params.slug)
  if (!event) return { title: 'Event not found' }
  return {
    title: event.title,
    description: event.summary ?? truncate(event.description, 155),
    openGraph: {
      title: event.title,
      description: event.summary ?? truncate(event.description, 155),
      images: event.coverImage ? [event.coverImage.url] : [],
    },
  }
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  if (!event) notFound()

  const time = event.allDay ? 'All day' : formatTimeRange(event.startTime, event.endTime)
  const images = event.media.filter((m) => m.kind === 'IMAGE')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startTime
      ? `${event.startDate.toISOString().slice(0, 10)}T${event.startTime}:00+05:30`
      : event.startDate.toISOString().slice(0, 10),
    endDate: event.endDate?.toISOString().slice(0, 10),
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: event.location, address: 'Village Ratouli, Yamunanagar, Haryana 135003, India' },
    description: event.summary ?? truncate(event.description, 300),
    image: event.coverImage ? [event.coverImage.url] : undefined,
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {event.coverImage && (
        <div className="relative h-[45vh] min-h-[18rem] w-full">
          <Image src={event.coverImage.url} alt={event.coverImage.altText ?? ''} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="shell grid gap-14 py-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
        <div>
          <Link href="/events" className="link-underline text-step--1">
            Back to all events
          </Link>

          {event.category && (
            <p className="mt-6 flex items-center gap-2 text-step--1 text-bark-muted">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: event.category.color }} />
              {event.category.name}
            </p>
          )}

          {event.titleHi && (
            <p lang="hi" className="font-display text-step-2 text-sindoor">
              {event.titleHi}
            </p>
          )}
          <h1 className="text-step-4">{event.title}</h1>

          {event.summary && <p className="mt-4 max-w-prose text-step-1 text-bark-soft">{event.summary}</p>}

          <div className="prose-temple mt-8">
            {event.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {images.length > 0 && (
            <section className="mt-14">
              <ArchDivider className="mb-10" />
              <h2 className="mb-6 text-step-2">Photographs</h2>
              <GalleryGrid images={images} columns={3} />
            </section>
          )}

          {event.videos.length > 0 && (
            <section className="mt-14">
              <ArchDivider className="mb-10" />
              <h2 className="mb-6 text-step-2">Videos</h2>
              <VideoGrid videos={event.videos} />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-bark/15 p-6">
            <dl className="space-y-4 text-step--1">
              <div>
                <dt className="text-bark-muted">Date</dt>
                <dd className="text-step-0">{formatDateRange(event.startDate, event.endDate)}</dd>
              </div>
              {time && (
                <div>
                  <dt className="text-bark-muted">Time</dt>
                  <dd className="text-step-0 tabular-nums">{time}</dd>
                </div>
              )}
              <div>
                <dt className="text-bark-muted">Where</dt>
                <dd className="text-step-0">{event.location}</dd>
              </div>
              {event.organizer && (
                <div>
                  <dt className="text-bark-muted">Organised by</dt>
                  <dd className="text-step-0">{event.organizer}</dd>
                </div>
              )}
              {event.contactPhone && (
                <div>
                  <dt className="text-bark-muted">Contact</dt>
                  <dd className="text-step-0">
                    {event.contactName && `${event.contactName} · `}
                    <a href={`tel:${event.contactPhone.replace(/\s/g, '')}`} className="link-underline">
                      {event.contactPhone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {event.registrationNote && (
              <p className="mt-5 border-l-2 border-brass bg-brass-tint px-4 py-3 text-step--1">
                {event.registrationNote}
              </p>
            )}

            <div className="mt-6 space-y-3">
              {event.registrationUrl && (
                <a href={event.registrationUrl} target="_blank" rel="noreferrer noopener" className="btn-primary w-full">
                  Register
                </a>
              )}
              <ShareButton title={event.title} />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${event.location}, Ratouli, Yamunanagar, Haryana 135003`)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost w-full"
              >
                Get directions
              </a>
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}
