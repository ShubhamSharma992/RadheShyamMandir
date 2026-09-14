import type { Metadata } from 'next'
import { getTempleInfo, getTimings } from '@/lib/queries'
import { PageHeader } from '@/components/site/PageHeader'
import { ContactForm } from '@/components/site/ContactForm'
import { formatTime } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Address, darshan timings, phone number and directions for the temple in Ratouli, Yamunanagar.',
}

const DAYS = ['Every day', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default async function ContactPage() {
  const [temple, timings] = await Promise.all([getTempleInfo(), getTimings()])

  const address = [
    temple?.addressLine ?? 'Village Ratouli',
    temple?.district ?? 'Yamunanagar',
    temple?.state ?? 'Haryana',
    temple?.pincode ?? '135003',
  ].join(', ')

  const query = encodeURIComponent(`${temple?.name ?? 'Temple'}, ${address}`)
  const directions = temple?.mapsPlaceUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${query}`
  const embed =
    temple?.latitude && temple?.longitude
      ? `https://www.google.com/maps?q=${temple.latitude},${temple.longitude}&hl=en&z=15&output=embed`
      : `https://www.google.com/maps?q=${query}&hl=en&z=14&output=embed`

  return (
    <>
      <PageHeader
        title="Contact and directions"
        titleHi="संपर्क"
        intro="Come for darshan, ask about an event, or offer seva."
      />

      <div className="shell grid gap-14 py-14 lg:grid-cols-[20rem_1fr] lg:gap-20">
        <div className="space-y-10">
          <section>
            <h2 className="text-step-2">Address</h2>
            <address className="mt-3 not-italic leading-relaxed text-bark-soft">
              {temple?.addressLine ?? 'Village Ratouli'}
              <br />
              {temple?.district ?? 'Yamunanagar'} district
              <br />
              {temple?.state ?? 'Haryana'} {temple?.pincode ?? '135003'}
              <br />
              {temple?.country ?? 'India'}
            </address>
            <a href={directions} target="_blank" rel="noreferrer noopener" className="btn-primary mt-5">
              Get directions
            </a>
          </section>

          <section id="timings" className="scroll-mt-28">
            <h2 className="text-step-2">Darshan timings</h2>
            {timings.length === 0 ? (
              <p className="mt-3 text-step--1 text-bark-muted">Timings have not been added yet.</p>
            ) : (
              <dl className="mt-4 space-y-4 text-step--1">
                {timings.map((t) => (
                  <div key={t.id} className="border-b border-bark/10 pb-3">
                    <dt className="text-bark">
                      {t.label}
                      {t.labelHi && (
                        <span lang="hi" className="ml-2 text-sindoor">
                          {t.labelHi}
                        </span>
                      )}
                    </dt>
                    <dd className="mt-0.5 tabular-nums text-bark-soft">
                      {DAYS[t.dayOfWeek]} · {formatTime(t.opensAt)} – {formatTime(t.closesAt)}
                    </dd>
                    {t.note && <dd className="mt-0.5 text-bark-muted">{t.note}</dd>}
                  </div>
                ))}
              </dl>
            )}
          </section>

          {(temple?.phone || temple?.email || temple?.whatsapp) && (
            <section>
              <h2 className="text-step-2">Speak to someone</h2>
              <ul className="mt-3 space-y-2 text-step--1">
                {temple.phone && (
                  <li>
                    <a href={`tel:${temple.phone.replace(/\s/g, '')}`} className="link-underline">
                      {temple.phone}
                    </a>
                  </li>
                )}
                {temple.altPhone && (
                  <li>
                    <a href={`tel:${temple.altPhone.replace(/\s/g, '')}`} className="link-underline">
                      {temple.altPhone}
                    </a>
                  </li>
                )}
                {temple.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${temple.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
                {temple.email && (
                  <li>
                    <a href={`mailto:${temple.email}`} className="link-underline">
                      {temple.email}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-step-2">Send a message</h2>
            <p className="mt-2 max-w-prose text-step--1 text-bark-soft">
              Messages go to the temple committee. For anything urgent, please call.
            </p>
            <div className="mt-6 max-w-xl">
              <ContactForm />
            </div>
          </section>

          <section>
            <h2 className="text-step-2">On the map</h2>
            <div className="mt-4 aspect-[4/3] w-full bg-parchment">
              <iframe
                src={embed}
                title={`Map showing ${temple?.name ?? 'the temple'} in Ratouli`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
