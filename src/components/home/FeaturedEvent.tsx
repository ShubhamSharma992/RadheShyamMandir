import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedEvent } from '@/lib/queries'
import { formatDateRange, formatTimeRange, truncate } from '@/lib/utils'
import { Kalash } from '@/components/ui/Arch'

export async function FeaturedEvent() {
  const event = await getFeaturedEvent()
  if (!event) return null

  const time = event.allDay ? 'All day' : formatTimeRange(event.startTime, event.endTime)

  return (
    <section className="bg-bark text-whitewash">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[20rem] lg:min-h-[32rem]">
          {event.coverImage ? (
            <Image
              src={event.coverImage.url}
              alt={event.coverImage.altText ?? ''}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-tulsi" />
          )}
        </div>

        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16">
          <p className="flex items-center gap-2 text-step--1 text-brass">
            <Kalash className="h-4 w-4" />
            This month at the temple
          </p>

          {event.titleHi && (
            <p lang="hi" className="mt-4 font-display text-step-2 text-brass">
              {event.titleHi}
            </p>
          )}
          <h2 className="mt-1 text-step-4">{event.title}</h2>

          <dl className="mt-6 space-y-2 text-step--1 text-whitewash/75">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-whitewash/50">When</dt>
              <dd>
                {formatDateRange(event.startDate, event.endDate)}
                {time ? ` · ${time}` : ''}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 text-whitewash/50">Where</dt>
              <dd>{event.location}</dd>
            </div>
          </dl>

          <p className="mt-6 max-w-prose text-whitewash/80">
            {event.summary ?? truncate(event.description, 240)}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/events/${event.slug}`} className="btn-brass">
              Event details
            </Link>
            <Link
              href="/calendar"
              className="btn border border-whitewash/35 text-whitewash hover:border-whitewash hover:bg-whitewash/10"
            >
              See the calendar
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
