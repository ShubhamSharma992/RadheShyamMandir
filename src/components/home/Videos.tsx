import { getVideos } from '@/lib/queries'
import { VideoGrid } from '@/components/site/VideoPlayer'
import { SectionHeading } from '@/components/ui/SectionHeading'

export async function Videos() {
  const videos = await getVideos(3)
  if (videos.length === 0) return null

  return (
    <section className="section">
      <div className="shell">
        <SectionHeading
          title="Recent recordings"
          titleHi="वीडियो"
          intro="Aarti, kirtan and festival recordings shared by the committee."
          action={{ href: '/gallery?type=videos', label: 'All videos' }}
        />
        <VideoGrid videos={videos} />
      </div>
    </section>
  )
}
