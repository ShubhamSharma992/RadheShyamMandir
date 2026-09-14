import { prisma } from '@/lib/prisma'
import { formatDate, cn } from '@/lib/utils'
import { markMessageRead } from '../actions'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div>
      <h1 className="text-step-3">Messages</h1>
      <p className="mt-2 max-w-prose text-step--1 text-bark-soft">
        Sent through the contact form on the website.
      </p>

      {messages.length === 0 ? (
        <p className="mt-10 border border-dashed border-bark/20 px-6 py-14 text-center text-bark-muted">
          No messages yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-bark/10 border-y border-bark/15">
          {messages.map((message) => (
            <li key={message.id} className={cn('py-5', !message.isRead && 'border-l-2 border-brass pl-4')}>
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-step-1">{message.subject || 'No subject'}</p>
                  <p className="mt-1 text-step--1 text-bark-muted">
                    {message.name}
                    {message.phone && ` · ${message.phone}`}
                    {message.email && ` · ${message.email}`} · {formatDate(message.createdAt)}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-step--1 text-bark-soft">{message.message}</p>
                </div>

                {!message.isRead && (
                  <form action={markMessageRead}>
                    <input type="hidden" name="id" value={message.id} />
                    <button type="submit" className="text-step--1 text-bark-soft hover:text-sindoor">
                      Mark as read
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
