import Image from 'next/image'
import Link from 'next/link'
import { formatDateRange, formatTimeRange } from '@/lib/utils'

export type EventCardData = {
  id: string
  title: string
  titleHi?: string | null
  slug: string
  summary?: string | null
  startDate: Date
  endDate?: Date | null
  startTime?: string | null
  endTime?: string | null
  allDay?: boolean
  location: string
  category?: { name: string; slug: string; color: string } | null
  coverImage?: { url: string; thumbnailUrl?: string | null; altText?: string | null } | null
}

/** Arch-topped image, hairline rule beneath. No shadow, no rounded box. */
export function EventCard({ event, priority = false }: { event: EventCardData; priority?: boolean }) {
  const time = event.allDay ? 'All day' : formatTimeRange(event.startTime, event.endTime)

  return (
    <article className="group flex flex-col">
      <Link href={`/events/${event.slug}`} className="block overflow-hidden">
        <div className="arch-mask relative aspect-[4/5] bg-parchment">
          {event.coverImage ? (
            <Image
              src={event.coverImage.thumbnailUrl ?? event.coverImage.url}
              alt={event.coverImage.altText ?? ''}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-end justify-center pb-8 text-bark-muted">
              <span className="font-display text-step-1">{event.category?.name ?? 'Temple event'}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col border-t border-bark/15 pt-4">
        {event.category && (
          <p className="mb-1 flex items-center gap-2 text-step--1 text-bark-muted">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: event.category.color }}
              aria-hidden
            />
            {event.category.name}
          </p>
        )}

        {event.titleHi && (
          <p lang="hi" className="font-display text-step-0 text-sindoor">
            {event.titleHi}
          </p>
        )}

        <h3 className="text-step-1">
          <Link href={`/events/${event.slug}`} className="hover:text-sindoor">
            {event.title}
          </Link>
        </h3>

        <p className="mt-2 text-step--1 text-bark">
          <time dateTime={event.startDate.toISOString()}>{formatDateRange(event.startDate, event.endDate)}</time>
          {time && <span className="text-bark-muted"> · {time}</span>}
        </p>

        {event.summary && <p className="mt-2 line-clamp-3 text-step--1 text-bark-soft">{event.summary}</p>}

        <p className="mt-2 text-step--1 text-bark-muted">{event.location}</p>

        <Link
          href={`/events/${event.slug}`}
          className="link-underline mt-4 self-start text-step--1 font-medium"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
