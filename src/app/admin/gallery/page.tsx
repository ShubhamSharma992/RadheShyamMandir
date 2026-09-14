import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Uploader } from '@/components/admin/Uploader'
import { VideoForm } from '@/components/admin/VideoForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteMedia, deleteVideo, updateMedia } from '../actions'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage({ searchParams }: { searchParams: { tab?: string } }) {
  const videosTab = searchParams.tab === 'videos'

  const [media, albums, videos, events] = await Promise.all([
    videosTab ? Promise.resolve([]) : prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 60, include: { album: true } }),
    prisma.album.findMany({ orderBy: { sortOrder: 'asc' } }),
    videosTab ? prisma.video.findMany({ orderBy: { createdAt: 'desc' }, take: 40 }) : Promise.resolve([]),
    prisma.event.findMany({ orderBy: { startDate: 'desc' }, take: 50, select: { id: true, title: true } }),
  ])

  return (
    <div>
      <h1 className="text-step-3">Photos and videos</h1>

      <div className="mt-6 flex gap-5 border-b border-bark/15 pb-4">
        <Link href="/admin/gallery" className={cn('text-step--1', !videosTab ? 'text-sindoor' : 'text-bark-soft hover:text-sindoor')}>
          Photographs
        </Link>
        <Link href="/admin/gallery?tab=videos" className={cn('text-step--1', videosTab ? 'text-sindoor' : 'text-bark-soft hover:text-sindoor')}>
          Videos
        </Link>
      </div>

      {videosTab ? (
        <div className="mt-10 grid gap-14 lg:grid-cols-[22rem_1fr]">
          <section>
            <h2 className="mb-5 text-step-2">Add a video</h2>
            <VideoForm events={events} />
          </section>

          <section>
            <h2 className="mb-5 text-step-2">Added</h2>
            {videos.length === 0 ? (
              <p className="border border-dashed border-bark/20 px-6 py-12 text-center text-bark-muted">No videos yet.</p>
            ) : (
              <ul className="divide-y divide-bark/10 border-y border-bark/15">
                {videos.map((video) => (
                  <li key={video.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-step-1">{video.title}</span>
                      <span className="block text-step--1 text-bark-muted">
                        {video.source === 'YOUTUBE' ? 'YouTube' : 'Uploaded'}
                        {video.isFeatured && ' · featured'}
                      </span>
                    </span>
                    <DeleteButton action={deleteVideo} id={video.id} confirm={`Remove "${video.title}"?`} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <>
          <div className="mt-10">
            <Uploader />
          </div>

          <h2 className="mt-14 text-step-2">Media library</h2>
          {media.length === 0 ? (
            <p className="mt-4 border border-dashed border-bark/20 px-6 py-12 text-center text-bark-muted">
              Nothing uploaded yet. Drop some photographs above to get started.
            </p>
          ) : (
            <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((asset) => (
                <li key={asset.id} className="border border-bark/15">
                  <div className="aspect-[4/3] bg-parchment">
                    {asset.kind === 'IMAGE' ? (
                      <Image
                        src={asset.thumbnailUrl ?? asset.url}
                        alt=""
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-step--1 text-bark-muted">Video file</span>
                    )}
                  </div>

                  <form action={updateMedia} className="space-y-3 p-4">
                    <input type="hidden" name="id" value={asset.id} />

                    <div>
                      <label htmlFor={`t-${asset.id}`} className="field-label">Title</label>
                      <input id={`t-${asset.id}`} name="title" defaultValue={asset.title ?? ''} className="field" />
                    </div>

                    <div>
                      <label htmlFor={`c-${asset.id}`} className="field-label">Caption</label>
                      <input id={`c-${asset.id}`} name="caption" defaultValue={asset.caption ?? ''} className="field" />
                    </div>

                    <div>
                      <label htmlFor={`alt-${asset.id}`} className="field-label">Description for screen readers</label>
                      <input id={`alt-${asset.id}`} name="altText" defaultValue={asset.altText ?? ''} className="field" />
                    </div>

                    <div>
                      <label htmlFor={`al-${asset.id}`} className="field-label">Album</label>
                      <select id={`al-${asset.id}`} name="albumId" defaultValue={asset.albumId ?? ''} className="field">
                        <option value="">No album</option>
                        {albums.map((album) => (
                          <option key={album.id} value={album.id}>{album.name}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-step--1">
                      <input type="checkbox" name="isFeatured" defaultChecked={asset.isFeatured} className="h-4 w-4 accent-sindoor" />
                      Show in the home page preview
                    </label>

                    <div className="flex items-center justify-between gap-4 pt-1 text-step--1">
                      <button type="submit" className="font-medium text-sindoor hover:text-sindoor-deep">Save</button>
                      <DeleteButton action={deleteMedia} id={asset.id} confirm="Delete this file?" />
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
