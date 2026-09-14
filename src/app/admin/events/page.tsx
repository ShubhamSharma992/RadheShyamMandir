import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDateRange, cn } from '@/lib/utils'
import { deleteEvent, toggleEventFlag } from '../actions'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const dynamic = 'force-dynamic'

const PER_PAGE = 20

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const q = searchParams.q?.trim()

  const where = {
    ...(searchParams.status ? { status: searchParams.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { location: { contains: q, mode: 'insensitive' as const } }] } : {}),
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'desc' },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: { category: { select: { name: true, color: true } } },
    }),
    prisma.event.count({ where }),
  ])

  const pages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-step-3">Events</h1>
        <Link href="/admin/events/new" className="btn-primary">
          Add an event
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title or place"
          className="field max-w-xs"
          aria-label="Search events"
        />
        <select name="status" defaultValue={searchParams.status ?? ''} className="field max-w-[10rem]" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button type="submit" className="btn-ghost">
          Apply
        </button>
      </form>

      {events.length === 0 ? (
        <p className="mt-10 border border-dashed border-bark/20 px-6 py-14 text-center text-bark-muted">
          No events match. <Link href="/admin/events" className="link-underline">Clear the filters</Link> or{' '}
          <Link href="/admin/events/new" className="link-underline">add one</Link>.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-bark/10 border-y border-bark/15">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap items-start gap-x-6 gap-y-3 py-5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/events/${event.id}`} className="font-display text-step-1 hover:text-sindoor">
                    {event.title}
                  </Link>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[0.7rem]',
                      event.status === 'PUBLISHED' ? 'bg-tulsi-tint text-tulsi' : 'bg-bark/10 text-bark-soft',
                    )}
                  >
                    {event.status.toLowerCase()}
                  </span>
                  {event.isFeatured && <span className="bg-brass-tint px-2 py-0.5 text-[0.7rem] text-brass-deep">featured</span>}
                </p>
                <p className="mt-1 text-step--1 text-bark-muted">
                  {formatDateRange(event.startDate, event.endDate)}
                  {event.category && ` · ${event.category.name}`} · {event.location}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-step--1">
                <form action={toggleEventFlag}>
                  <input type="hidden" name="id" value={event.id} />
                  <input type="hidden" name="field" value="status" />
                  <button type="submit" className="text-bark-soft hover:text-sindoor">
                    {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                </form>

                <form action={toggleEventFlag}>
                  <input type="hidden" name="id" value={event.id} />
                  <input type="hidden" name="field" value="isFeatured" />
                  <button type="submit" className="text-bark-soft hover:text-sindoor">
                    {event.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                </form>

                <Link href={`/admin/events/${event.id}`} className="text-bark-soft hover:text-sindoor">
                  Edit
                </Link>

                <DeleteButton
                  action={deleteEvent}
                  id={event.id}
                  label="Delete"
                  confirm={`Delete "${event.title}"? Photographs stay in the gallery.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/events?page=${n}${q ? `&q=${q}` : ''}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
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
  )
}
