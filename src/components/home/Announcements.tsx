import Link from 'next/link'
import { getActiveAnnouncements } from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'

const TONE = {
  URGENT: { border: 'border-l-sindoor', label: 'Urgent', text: 'text-sindoor' },
  IMPORTANT: { border: 'border-l-brass-deep', label: 'Important', text: 'text-brass-deep' },
  NORMAL: { border: 'border-l-tulsi', label: null, text: 'text-tulsi' },
} as const

export async function Announcements() {
  const announcements = await getActiveAnnouncements(4)
  if (announcements.length === 0) return null

  return (
    <section className="section">
      <div className="shell">
        <SectionHeading title="Notices" titleHi="सूचना" />

        <ul className="grid gap-6 sm:grid-cols-2">
          {announcements.map((item) => {
            const tone = TONE[item.priority]
            return (
              <li key={item.id} className={`border-l-2 bg-parchment px-6 py-5 ${tone.border}`}>
                {tone.label && <p className={`text-step--1 font-medium ${tone.text}`}>{tone.label}</p>}
                {item.titleHi && (
                  <p lang="hi" className="font-display text-step-0 text-sindoor">
                    {item.titleHi}
                  </p>
                )}
                <h3 className="text-step-1">{item.title}</h3>
                <p className="mt-2 text-step--1 leading-relaxed text-bark-soft">{item.body}</p>
                <p className="mt-3 text-step--1 text-bark-muted">
                  Posted {formatDate(item.startsAt)}
                  {item.expiresAt && ` · until ${formatDate(item.expiresAt)}`}
                </p>
                {item.linkUrl && (
                  <Link href={item.linkUrl} className="link-underline mt-3 inline-block text-step--1">
                    Read more
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
