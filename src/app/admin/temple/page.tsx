import { getTempleInfo } from '@/lib/queries'
import { TempleInfoForm } from '@/components/admin/TempleInfoForm'

export const dynamic = 'force-dynamic'

export default async function AdminTemplePage() {
  const temple = await getTempleInfo()

  return (
    <div>
      <h1 className="text-step-3">Temple information</h1>
      <p className="mt-2 max-w-prose text-step--1 text-bark-soft">
        This is the text that appears across the website — the name in the header, the welcome on the home page, and
        everything on the About page.
      </p>

      <div className="mt-10">
        <TempleInfoForm temple={(temple ?? {}) as Record<string, string | number | null>} />
      </div>
    </div>
  )
}
