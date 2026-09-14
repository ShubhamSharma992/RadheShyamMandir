import Link from 'next/link'

/**
 * Section headings pair the English title with its Devanagari equivalent
 * rather than a tracked-out eyebrow label.
 */
export function SectionHeading({
  title,
  titleHi,
  intro,
  action,
}: {
  title: string
  titleHi?: string
  intro?: string
  action?: { href: string; label: string }
}) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div>
        {titleHi && (
          <p lang="hi" className="font-display text-step-1 text-sindoor">
            {titleHi}
          </p>
        )}
        <h2 className="text-step-3">{title}</h2>
        {intro && <p className="mt-3 max-w-prose text-bark-soft">{intro}</p>}
      </div>
      {action && (
        <Link href={action.href} className="link-underline shrink-0 text-step--1 font-medium">
          {action.label}
        </Link>
      )}
    </header>
  )
}
