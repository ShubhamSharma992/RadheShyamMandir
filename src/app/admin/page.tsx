import Link from 'next/link'
import Image from 'next/image'
import { getDashboardStats } from '@/lib/queries'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const figures = [
    { label: 'Upcoming events', value: stats.upcoming, href: '/admin/events' },
    { label: 'Events in total', value: stats.events, href: '/admin/events' },
    { label: 'Drafts', value: stats.drafts, href: '/admin/events?status=DRAFT' },
    { label: 'Photographs', value: stats.photos, href: '/admin/gallery' },
    { label: 'Videos', value: stats.videos, href: '/admin/gallery?tab=videos' },
    { label: 'Live announcements', value: stats.announcements, href: '/admin/announcements' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-step-3">Dashboard</h1>
        <Link href="/admin/events/new" className="btn-primary">
          Add an event
        </Link>
      </div>

      {stats.unreadMessages > 0 && (
        <Link
          href="/admin/messages"
          className="mt-6 block border-l-2 border-brass bg-brass-tint px-5 py-4 text-step--1 hover:bg-brass/20"
        >
          {stats.unreadMessages} unread {stats.unreadMessages === 1 ? 'message' : 'messages'} from the contact form
        </Link>
      )}

      <ul className="mt-8 grid gap-px border border-bark/10 bg-bark/10 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((figure) => (
          <li key={figure.label} className="bg-whitewash">
            <Link href={figure.href} className="block px-6 py-6 transition-colors hover:bg-brass-tint">
              <span className="block font-display text-step-4 tabular-nums leading-none">{figure.value}</span>
              <span className="mt-2 block text-step--1 text-bark-soft">{figure.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="text-step-2">Recent uploads</h2>
          {stats.recentUploads.length === 0 ? (
            <p className="mt-4 border border-dashed border-bark/20 px-5 py-8 text-center text-step--1 text-bark-muted">
              Nothing uploaded yet.{' '}
              <Link href="/admin/gallery" className="link-underline">
                Add photographs
              </Link>
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {stats.recentUploads.map((asset) => (
                <li key={asset.id} className="aspect-square overflow-hidden bg-parchment">
                  {asset.kind === 'IMAGE' ? (
                    <Image
                      src={asset.thumbnailUrl ?? asset.url}
                      alt=""
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-step--1 text-bark-muted">Video</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-step-2">Recent changes</h2>
          {stats.recentLogs.length === 0 ? (
            <p className="mt-4 text-step--1 text-bark-muted">No changes recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-bark/10 border-y border-bark/15 text-step--1">
              {stats.recentLogs.map((log) => (
                <li key={log.id} className="flex flex-wrap justify-between gap-2 py-3">
                  <span>
                    {log.actor?.name ?? 'Someone'} {log.action} {log.entityType.toLowerCase()}
                    {log.summary && <span className="text-bark-muted"> — {log.summary}</span>}
                  </span>
                  <span className="text-bark-muted">{formatDate(log.createdAt, { month: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
