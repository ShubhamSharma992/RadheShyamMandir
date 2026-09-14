import Link from 'next/link'
import { getTempleInfo, getTimings } from '@/lib/queries'
import { formatTime } from '@/lib/utils'
import { NAV } from './SiteHeader'

export async function SiteFooter() {
  const [temple, timings] = await Promise.all([getTempleInfo(), getTimings()])
  const year = new Date().getFullYear()

  const social = [
    { href: temple?.facebookUrl, label: 'Facebook' },
    { href: temple?.instagramUrl, label: 'Instagram' },
    { href: temple?.youtubeUrl, label: 'YouTube' },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href))

  return (
    <footer className="mt-auto border-t border-bark/10 bg-parchment">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {temple?.nameHi && (
            <p lang="hi" className="font-display text-step-1 text-sindoor">
              {temple.nameHi}
            </p>
          )}
          <p className="font-display text-step-2">{temple?.name ?? 'Village Temple, Ratouli'}</p>
          <address className="mt-3 not-italic text-step--1 leading-relaxed text-bark-soft">
            {temple?.addressLine ?? 'Village Ratouli'}
            <br />
            {temple?.district ?? 'Yamunanagar'}, {temple?.state ?? 'Haryana'} {temple?.pincode ?? '135003'}
            <br />
            {temple?.country ?? 'India'}
          </address>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-step-1">Pages</h2>
          <ul className="mt-3 space-y-2 text-step--1 text-bark-soft">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-sindoor">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/gallery?type=videos" className="hover:text-sindoor">
                Videos
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-step-1">Darshan timings</h2>
          <ul className="mt-3 space-y-2 text-step--1 text-bark-soft">
            {timings.length > 0 ? (
              timings.map((t) => (
                <li key={t.id} className="flex justify-between gap-4">
                  <span>{t.label}</span>
                  <span className="tabular-nums text-bark">
                    {formatTime(t.opensAt)} – {formatTime(t.closesAt)}
                  </span>
                </li>
              ))
            ) : (
              <li>Timings will be listed here once the committee adds them.</li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-step-1">Reach us</h2>
          <ul className="mt-3 space-y-2 text-step--1 text-bark-soft">
            {temple?.phone && (
              <li>
                <a href={`tel:${temple.phone.replace(/\s/g, '')}`} className="hover:text-sindoor">
                  {temple.phone}
                </a>
              </li>
            )}
            {temple?.email && (
              <li>
                <a href={`mailto:${temple.email}`} className="hover:text-sindoor">
                  {temple.email}
                </a>
              </li>
            )}
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer noopener" className="hover:text-sindoor">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-bark/10">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-step--1 text-bark-muted">
          <p>
            © {year} {temple?.name ?? 'Village Temple, Ratouli'}
          </p>
          <Link href="/admin" className="hover:text-sindoor">
            Committee login
          </Link>
        </div>
      </div>
    </footer>
  )
}
