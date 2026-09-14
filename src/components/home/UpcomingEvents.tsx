import { getUpcomingEvents } from '@/lib/queries'
import { EventCard } from '@/components/site/EventCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Empty } from '@/components/ui/Empty'

export async function UpcomingEvents() {
  const events = await getUpcomingEvents(3)

  return (
    <section className="section bg-parchment">
      <div className="shell">
        <SectionHeading
          title="What's coming up"
          titleHi="आगामी कार्यक्रम"
          action={{ href: '/events', label: 'View all events' }}
        />

        {events.length === 0 ? (
          <Empty
            title="No events scheduled yet"
            body="The next puja, bhandara or festival will appear here as soon as the committee adds it."
            action={{ href: '/calendar', label: 'Open the calendar' }}
          />
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} priority={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
