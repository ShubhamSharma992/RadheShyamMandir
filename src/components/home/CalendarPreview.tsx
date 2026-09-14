import Link from 'next/link'
import { getEventsInRange } from '@/lib/queries'
import { Calendar } from '@/components/site/Calendar'
import { SectionHeading } from '@/components/ui/SectionHeading'

export async function CalendarPreview() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const events = await getEventsInRange(from, to)
  if (events.length === 0) return null

  return (
    <section className="section bg-parchment">
      <div className="shell">
        <SectionHeading
          title="This month"
          titleHi="पंचांग"
          action={{ href: '/calendar', label: 'Full calendar' }}
        />
        <Calendar
          compact
          events={events.map((e) => ({
            ...e,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate?.toISOString() ?? null,
          }))}
        />
        <Link href="/calendar" className="btn-ghost mt-8">
          Browse other months
        </Link>
      </div>
    </section>
  )
}
