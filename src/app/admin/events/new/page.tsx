import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCategories } from '@/lib/queries'
import { EventForm } from '@/components/admin/EventForm'

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  const [categories, library] = await Promise.all([
    getCategories(),
    prisma.mediaAsset.findMany({ where: { kind: 'IMAGE' }, orderBy: { createdAt: 'desc' }, take: 24 }),
  ])

  return (
    <div>
      <Link href="/admin/events" className="link-underline text-step--1">
        Back to events
      </Link>
      <h1 className="mt-4 text-step-3">Add an event</h1>
      <p className="mt-2 max-w-prose text-step--1 text-bark-soft">
        Save it as a draft first if you are still waiting on details. Nothing appears on the website until it is published.
      </p>

      <div className="mt-10">
        <EventForm categories={categories} library={library} />
      </div>
    </div>
  )
}
