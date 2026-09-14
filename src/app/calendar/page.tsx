import type { Metadata } from 'next'
import { getCategories, getEventsInRange } from '@/lib/queries'
import { Calendar } from '@/components/site/Calendar'
import { PageHeader } from '@/components/site/PageHeader'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Month-by-month calendar of puja, festivals and gatherings at the temple in Ratouli.',
}

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const now = new Date()
  const anchor = /^\d{4}-\d{2}$/.test(searchParams.month ?? '')
    ? new Date(`${searchParams.month}-01T00:00:00`)
    : now

  // Pull a generous window so moving a month or two needs no round trip.
  const from = new Date(anchor.getFullYear(), anchor.getMonth() - 6, 1)
  const to = new Date(anchor.getFullYear(), anchor.getMonth() + 12, 0)

  const [events, categories] = await Promise.all([getEventsInRange(from, to), getCategories()])

  return (
    <>
      <PageHeader
        title="Temple calendar"
        titleHi="पंचांग"
        intro="Every published event, month by month. Tap a day to see what is happening."
      />

      <div className="shell py-12">
        {categories.length > 0 && (
          <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-step--1 text-bark-soft">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </li>
            ))}
          </ul>
        )}

        <Calendar
          initialMonth={searchParams.month}
          events={events.map((e) => ({
            ...e,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate?.toISOString() ?? null,
          }))}
        />
      </div>
    </>
  )
}
