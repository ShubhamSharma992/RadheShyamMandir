import type { Metadata } from 'next'
import Link from 'next/link'
import { getAlbums, getGalleryImages, getVideos } from '@/lib/queries'
import { GalleryGrid } from '@/components/site/Lightbox'
import { VideoGrid } from '@/components/site/VideoPlayer'
import { PageHeader } from '@/components/site/PageHeader'
import { Empty } from '@/components/ui/Empty'
import { cn } from '@/lib/utils'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photographs and videos from festivals, puja and daily life at the temple in Ratouli.',
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { type?: string; album?: string }
}) {
  const showVideos = searchParams.type === 'videos'
  const [albums, images, videos] = await Promise.all([
    getAlbums(),
    showVideos ? Promise.resolve([]) : getGalleryImages({ take: 60, albumSlug: searchParams.album }),
    showVideos ? getVideos(40) : Promise.resolve([]),
  ])

  return (
    <>
      <PageHeader
        title="Gallery"
        titleHi="चित्रशाला"
        intro="Photographs and recordings shared by the temple committee and the village."
      />

      <div className="shell py-12">
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-bark/15 pb-5">
          <div className="flex gap-4">
            <Link
              href="/gallery"
              className={cn('text-step--1', !showVideos ? 'text-sindoor underline decoration-brass underline-offset-4' : 'text-bark-soft hover:text-sindoor')}
            >
              Photos
            </Link>
            <Link
              href="/gallery?type=videos"
              className={cn('text-step--1', showVideos ? 'text-sindoor underline decoration-brass underline-offset-4' : 'text-bark-soft hover:text-sindoor')}
            >
              Videos
            </Link>
          </div>

          {!showVideos && albums.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Link
                href="/gallery"
                className={cn(
                  'border px-3 py-1.5 text-step--1 transition-colors',
                  !searchParams.album ? 'border-bark bg-bark text-whitewash' : 'border-bark/20 text-bark-soft hover:border-bark/60',
                )}
              >
                All
              </Link>
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/gallery?album=${album.slug}`}
                  className={cn(
                    'border px-3 py-1.5 text-step--1 transition-colors',
                    searchParams.album === album.slug
                      ? 'border-bark bg-bark text-whitewash'
                      : 'border-bark/20 text-bark-soft hover:border-bark/60',
                  )}
                >
                  {album.name}
                  <span className="ml-2 tabular-nums opacity-60">{album._count.media}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {showVideos ? (
          videos.length === 0 ? (
            <Empty title="No videos yet" body="Recordings of aarti, kirtan and festivals will be posted here." action={{ href: '/gallery', label: 'See photographs' }} />
          ) : (
            <VideoGrid videos={videos} />
          )
        ) : images.length === 0 ? (
          <Empty title="No photographs yet" body="Once the committee uploads photographs from the temple, they will appear here." action={{ href: '/events', label: 'See upcoming events' }} />
        ) : (
          <GalleryGrid images={images} columns={4} />
        )}
      </div>
    </>
  )
}
