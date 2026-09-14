import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminNav } from '@/components/admin/AdminNav'
import { logout } from './actions'

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // The login page renders inside this layout too, so allow it through
  // unauthenticated — middleware already gated everything else.
  if (!session) {
    return <div className="shell">{children}</div>
  }

  return (
    <div className="shell grid gap-10 py-10 lg:grid-cols-[14rem_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="font-display text-step-1">{session.name}</p>
        <p className="text-step--1 text-bark-muted">{session.role === 'ADMIN' ? 'Administrator' : 'Editor'}</p>

        <AdminNav />

        <form action={logout} className="mt-8">
          <button type="submit" className="text-step--1 text-bark-soft hover:text-sindoor">
            Sign out
          </button>
        </form>

        <Link href="/" className="mt-4 block text-step--1 text-bark-muted hover:text-sindoor">
          View the website
        </Link>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
