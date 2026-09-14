import { getGalleryImages } from '@/lib/queries'
import { GalleryGrid } from '@/components/site/Lightbox'
import { SectionHeading } from '@/components/ui/SectionHeading'

export async function GalleryPreview() {
  const images = await getGalleryImages({ take: 9 })
  if (images.length === 0) return null

  return (
    <section className="section bg-parchment">
      <div className="shell">
        <SectionHeading
          title="From the temple"
          titleHi="चित्रशाला"
          action={{ href: '/gallery', label: 'View the full gallery' }}
        />
        <GalleryGrid images={images} columns={3} />
      </div>
    </section>
  )
}
