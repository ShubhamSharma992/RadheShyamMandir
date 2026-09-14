import { Suspense } from 'react'
import { Hero } from '@/components/home/Hero'
import { Welcome } from '@/components/home/Welcome'
import { UpcomingEvents } from '@/components/home/UpcomingEvents'
import { Highlights } from '@/components/home/Highlights'
import { FeaturedEvent } from '@/components/home/FeaturedEvent'
import { Announcements } from '@/components/home/Announcements'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { Videos } from '@/components/home/Videos'
import { CalendarPreview } from '@/components/home/CalendarPreview'
import { Location } from '@/components/home/Location'

/** Revalidate hourly; admin writes revalidate the affected paths immediately. */
export const revalidate = 3600

export default function HomePage() {
  return (
    <>
      <Hero />
      <Welcome />
      <Suspense>
        <UpcomingEvents />
      </Suspense>
      <Highlights />
      <Suspense>
        <FeaturedEvent />
      </Suspense>
      <Suspense>
        <Announcements />
      </Suspense>
      <Suspense>
        <GalleryPreview />
      </Suspense>
      <Suspense>
        <Videos />
      </Suspense>
      <Suspense>
        <CalendarPreview />
      </Suspense>
      <Location />
    </>
  )
}
