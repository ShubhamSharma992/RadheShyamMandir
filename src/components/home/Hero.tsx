import Image from 'next/image'
import Link from 'next/link'
import { getDarshanStatus, getTempleInfo } from '@/lib/queries'
import { formatTime } from '@/lib/utils'

export async function Hero() {
  const [temple, status] = await Promise.all([getTempleInfo(), getDarshanStatus()])

  return (
    <section className="relative isolate flex min-h-[min(88dvh,44rem)] flex-col justify-end overflow-hidden">
      {temple?.heroImageUrl ? (
        <Image
          src={temple.heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-tulsi to-bark" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bark via-bark/55 to-bark/20" />

      <div className="shell pb-0 pt-28 sm:pt-36">
        <div className="max-w-3xl animate-rise pb-10">
          {temple?.nameHi && (
            <p lang="hi" className="font-display text-step-2 text-brass">
              {temple.nameHi}
            </p>
          )}
          <h1 className="font-display text-step-5 text-whitewash">{temple?.name ?? 'Village Temple, Ratouli'}</h1>
          <p className="mt-3 text-step-1 text-whitewash/80">
            {temple?.addressLine ?? 'Village Ratouli'}, {temple?.district ?? 'Yamunanagar'},{' '}
            {temple?.state ?? 'Haryana'}
          </p>
          {temple?.tagline && <p className="mt-5 max-w-prose text-whitewash/75">{temple.tagline}</p>}

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/about" className="btn-brass">
              Explore the temple
            </Link>
            <Link
              href="/events"
              className="btn border border-whitewash/40 text-whitewash hover:border-whitewash hover:bg-whitewash/10"
            >
              Upcoming events
            </Link>
            <Link
              href="/gallery"
              className="btn border border-whitewash/40 text-whitewash hover:border-whitewash hover:bg-whitewash/10"
            >
              View gallery
            </Link>
          </div>
        </div>
      </div>

      {status && (
        <div className="border-t border-whitewash/15 bg-bark/55 backdrop-blur-sm">
          <div className="shell flex flex-wrap items-center gap-x-3 gap-y-1 py-4 text-step--1 text-whitewash/85">
            <span
              className={`inline-block h-2 w-2 rounded-full ${status.open ? 'animate-flame bg-brass' : 'bg-whitewash/40'}`}
              aria-hidden
            />
            {status.open ? (
              <span>
                Open now for {status.label.toLowerCase()} — until {formatTime(status.until)}
              </span>
            ) : (
              <span>
                Closed right now
                {status.next && (
                  <>
                    {' '}
                    · Opens {status.tomorrow ? 'tomorrow' : ''} at {formatTime(status.next)}
                    {status.label ? ` for ${status.label.toLowerCase()}` : ''}
                  </>
                )}
              </span>
            )}
            <Link href="/contact#timings" className="link-underline ml-auto text-whitewash">
              All timings
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
