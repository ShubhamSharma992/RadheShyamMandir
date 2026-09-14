import { cn } from '@/lib/utils'

/**
 * The torana arch that runs through the whole site. Used as a section
 * divider and, via .arch-mask, as the top edge of event and gallery images.
 */
export function ArchDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-5', className)} aria-hidden>
      <span className="h-px flex-1" style={{ background: 'var(--rule)' }} />
      <svg width="46" height="22" viewBox="0 0 46 22" fill="none" className="shrink-0">
        <path
          d="M1 21c0-8 5-14 11-16 4-1.5 8-4 11-5 3 1 7 3.5 11 5 6 2 11 8 11 16"
          stroke="var(--rule-brass)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <circle cx="23" cy="6" r="2" fill="#E0A128" />
      </svg>
      <span className="h-px flex-1" style={{ background: 'var(--rule)' }} />
    </div>
  )
}

/** Small brass kalash used as a bullet on lists. */
export function Kalash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('h-4 w-4 shrink-0', className)} aria-hidden>
      <path d="M8 1.5 9 3.5H7L8 1.5Z" fill="currentColor" />
      <path d="M4.5 5h7l-.8 1.6H5.3L4.5 5Z" fill="currentColor" opacity=".75" />
      <path d="M5.3 7h5.4c.6 1 .9 2.2.9 3.2 0 2-1.6 3.3-3.6 3.3S4.4 12.2 4.4 10.2c0-1 .3-2.2.9-3.2Z" fill="currentColor" />
    </svg>
  )
}
