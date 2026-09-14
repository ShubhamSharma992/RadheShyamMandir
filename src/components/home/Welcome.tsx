import { getTempleInfo } from '@/lib/queries'
import { ArchDivider } from '@/components/ui/Arch'

export async function Welcome() {
  const temple = await getTempleInfo()
  if (!temple?.welcomeBody) return null

  return (
    <section className="section">
      <div className="shell max-w-3xl text-center">
        <ArchDivider className="mb-10" />
        <h2 className="text-step-3">{temple.welcomeHeading ?? 'Welcome'}</h2>
        <div className="prose-temple mx-auto mt-5 text-center">
          {temple.welcomeBody.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
