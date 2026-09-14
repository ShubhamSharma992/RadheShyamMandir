import Link from 'next/link'
import { ArchDivider } from '@/components/ui/Arch'

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
      <ArchDivider className="mb-8 w-full max-w-xs" />
      <h1 className="text-step-3">This page isn't here</h1>
      <p className="mt-3 max-w-[46ch] text-bark-soft">
        The page may have been moved, or the event may have finished and been archived.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go to the home page
        </Link>
        <Link href="/events" className="btn-ghost">
          See all events
        </Link>
      </div>
    </div>
  )
}
