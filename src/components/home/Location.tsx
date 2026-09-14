import { getTempleInfo } from '@/lib/queries'

export async function Location() {
  const temple = await getTempleInfo()

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
    <section className="grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <p lang="hi" className="font-display text-step-1 text-sindoor">
          मंदिर तक पहुँचें
        </p>
        <h2 className="text-step-3">Finding the temple</h2>

        <address className="mt-5 not-italic text-step-1 leading-relaxed text-bark-soft">
          {temple?.addressLine ?? 'Village Ratouli'}
          <br />
          {temple?.district ?? 'Yamunanagar'} district, {temple?.state ?? 'Haryana'} {temple?.pincode ?? '135003'}
          <br />
          {temple?.country ?? 'India'}
        </address>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={directions} target="_blank" rel="noreferrer noopener" className="btn-primary">
            Get directions
          </a>
          {temple?.phone && (
            <a href={`tel:${temple.phone.replace(/\s/g, '')}`} className="btn-ghost">
              Call {temple.phone}
            </a>
          )}
        </div>
      </div>

      <div className="min-h-[22rem] bg-parchment lg:min-h-[30rem]">
        <iframe
          src={embed}
          title={`Map showing ${temple?.name ?? 'the temple'} in Ratouli`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
    </section>
  )
}
