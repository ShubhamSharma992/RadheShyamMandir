import Link from 'next/link'
import { Kalash } from './Arch'

/** Empty states point at the next useful action instead of apologising. */
export function Empty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="border border-dashed border-bark/20 px-6 py-14 text-center">
      <Kalash className="mx-auto mb-3 h-5 w-5 text-brass" />
      <p className="font-display text-step-1">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-step--1 text-bark-muted">{body}</p>
      {action && (
        <Link href={action.href} className="btn-ghost mt-6">
          {action.label}
        </Link>
      )}
    </div>
  )
}
