import { prisma } from '@/lib/prisma'
import { formatDate, cn } from '@/lib/utils'
import { AnnouncementForm } from '@/components/admin/AnnouncementForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteAnnouncement } from '../actions'

export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  const now = new Date()

  return (
    <div>
      <h1 className="text-step-3">Announcements</h1>
      <p className="mt-2 max-w-prose text-step--1 text-bark-soft">
        Short notices for the home page — a change in timings, a special puja, a temple closure.
      </p>

      <div className="mt-10 grid gap-14 lg:grid-cols-[22rem_1fr]">
        <section>
          <h2 className="mb-5 text-step-2">Post a new one</h2>
          <AnnouncementForm />
        </section>

        <section>
          <h2 className="mb-5 text-step-2">Posted</h2>
          {announcements.length === 0 ? (
            <p className="border border-dashed border-bark/20 px-6 py-12 text-center text-bark-muted">
              Nothing posted yet.
            </p>
          ) : (
            <ul className="divide-y divide-bark/10 border-y border-bark/15">
              {announcements.map((item) => {
                const expired = item.expiresAt ? item.expiresAt < now : false
                return (
                  <li key={item.id} className="flex flex-wrap items-start gap-x-6 gap-y-2 py-5">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-step-1">{item.title}</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 text-[0.7rem]',
                            expired
                              ? 'bg-bark/10 text-bark-muted'
                              : item.status === 'PUBLISHED'
                                ? 'bg-tulsi-tint text-tulsi'
                                : 'bg-bark/10 text-bark-soft',
                          )}
                        >
                          {expired ? 'expired' : item.status.toLowerCase()}
                        </span>
                        {item.priority !== 'NORMAL' && (
                          <span className="bg-brass-tint px-2 py-0.5 text-[0.7rem] text-brass-deep">
                            {item.priority.toLowerCase()}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 line-clamp-2 text-step--1 text-bark-soft">{item.body}</p>
                      <p className="mt-1 text-step--1 text-bark-muted">
                        From {formatDate(item.startsAt)}
                        {item.expiresAt && ` until ${formatDate(item.expiresAt)}`}
                      </p>
                    </div>

                    <DeleteButton
                      action={deleteAnnouncement}
                      id={item.id}
                      confirm={`Delete "${item.title}"?`}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
