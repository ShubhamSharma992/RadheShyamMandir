import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Committee login', robots: { index: false, follow: false } }

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const session = await getSession()
  if (session) redirect('/admin')

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-step-3">Committee login</h1>
        <p className="mt-2 text-step--1 text-bark-soft">
          This area is for temple committee members who manage the website.
        </p>
        <div className="mt-8">
          <LoginForm next={searchParams.next} />
        </div>
      </div>
    </div>
  )
}
