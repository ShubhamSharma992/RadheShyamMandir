import type { Metadata } from 'next'
import Link from 'next/link'
import { getTempleInfo, getTimings } from '@/lib/queries'
import { PageHeader } from '@/components/site/PageHeader'
import { ArchDivider } from '@/components/ui/Arch'
import { formatTime } from '@/lib/utils'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const temple = await getTempleInfo()
  return {
    title: 'About the temple',
    description: temple?.introduction?.slice(0, 155) ?? undefined,
  }
}

function Prose({ text }: { text: string }) {
  return (
    <div className="prose-temple">
      {text.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )
}

export default async function AboutPage() {
  const [temple, timings] = await Promise.all([getTempleInfo(), getTimings()])

  const sections = [
    { id: 'introduction', title: 'The temple', titleHi: 'परिचय', body: temple?.introduction },
    { id: 'history', title: 'History', titleHi: 'इतिहास', body: temple?.history },
    { id: 'significance', title: 'Religious significance', titleHi: 'महत्व', body: temple?.significance },
    { id: 'community', title: 'The village and the temple', titleHi: 'गाँव और मंदिर', body: temple?.community },
    { id: 'traditions', title: 'Traditions and festivals', titleHi: 'परंपराएँ', body: temple?.traditions },
  ].filter((s): s is typeof s & { body: string } => Boolean(s.body))

  return (
    <>
      <PageHeader
        title="About the temple"
        titleHi="मंदिर के बारे में"
        intro={temple?.tagline ?? undefined}
      />

      <div className="shell grid gap-16 py-16 lg:grid-cols-[1fr_18rem] lg:gap-20">
        <div>
          {sections.length === 0 ? (
            <p className="prose-temple">
              The committee has not added the temple's history yet. Once they do, it will appear here.
            </p>
          ) : (
            sections.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                {i > 0 && <ArchDivider className="my-12" />}
                <p lang="hi" className="font-display text-step-1 text-sindoor">
                  {section.titleHi}
                </p>
                <h2 className="text-step-3">{section.title}</h2>
                <div className="mt-5">
                  <Prose text={section.body} />
                </div>
              </section>
            ))
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-bark/15 p-6">
            <h2 className="text-step-1">Darshan timings</h2>
            {timings.length === 0 ? (
              <p className="mt-3 text-step--1 text-bark-muted">Timings have not been added yet.</p>
            ) : (
              <dl className="mt-4 space-y-3 text-step--1">
                {timings.map((t) => (
                  <div key={t.id}>
                    <dt className="text-bark-soft">{t.label}</dt>
                    <dd className="tabular-nums">
                      {formatTime(t.opensAt)} – {formatTime(t.closesAt)}
                      {t.note && <span className="block text-bark-muted">{t.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <hr className="rule my-6" />
            <nav className="space-y-2 text-step--1">
              {sections.map((s) => (
                <Link key={s.id} href={`#${s.id}`} className="block text-bark-soft hover:text-sindoor">
                  {s.title}
                </Link>
              ))}
            </nav>

            <Link href="/contact" className="btn-ghost mt-6 w-full">
              Contact the committee
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
