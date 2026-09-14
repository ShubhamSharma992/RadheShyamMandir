import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCategories } from '@/lib/queries'
import { EventForm } from '@/components/admin/EventForm'

export const dynamic = 'force-dynamic'

function toDateInput(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : ''
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const [event, categories] = await Promise.all([
    prisma.event.findUnique({ where: { id: params.id }, include: { media: true } }),
    getCategories(),
  ])

  if (!event) notFound()

  const library = await prisma.mediaAsset.findMany({
    where: { kind: 'IMAGE', OR: [{ eventId: event.id }, { eventId: null }] },
    orderBy: { createdAt: 'desc' },
    take: 36,
  })

  return (
    <div>
      <Link href="/admin/events" className="link-underline text-step--1">
        Back to events
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-step-3">Edit event</h1>
        {event.status === 'PUBLISHED' && (
          <Link href={`/events/${event.slug}`} className="link-underline text-step--1">
            View on the website
          </Link>
        )}
      </div>

      <div className="mt-10">
        <EventForm
          categories={categories}
          library={library}
          event={{
            ...event,
            startDate: toDateInput(event.startDate),
            endDate: toDateInput(event.endDate),
          }}
        />
      </div>
    </div>
  )
}
