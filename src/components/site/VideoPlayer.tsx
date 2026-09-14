'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export type VideoItem = {
  id: string
  title: string
  description?: string | null
  source: 'YOUTUBE' | 'UPLOAD'
  youtubeId?: string | null
  fileUrl?: string | null
  thumbnailUrl?: string | null
  event?: { title: string; slug: string } | null
}

/**
 * Videos load as a still until someone asks to play. Nothing autoplays,
 * and no YouTube embed is requested until the click — which also keeps
 * their cookies off the page for visitors who never watch.
 */
export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [active, setActive] = useState<VideoItem | null>(null)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active])

  return (
    <>
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.id}>
            <button type="button" onClick={() => setActive(video)} className="group block w-full text-left">
              <span className="relative block aspect-video overflow-hidden bg-bark">
                {video.thumbnailUrl && (
                  <Image
                    src={video.thumbnailUrl}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 90vw, 33vw"
                    className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sindoor/95 transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-whitewash" aria-hidden>
                      <path d="M7 4.5v15l13-7.5z" />
                    </svg>
                  </span>
                </span>
              </span>
              <span className="mt-3 block font-display text-step-1 group-hover:text-sindoor">{video.title}</span>
              {video.event && <span className="mt-1 block text-step--1 text-bark-muted">{video.event.title}</span>}
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bark/97 p-4"
          onClick={() => setActive(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-6">
              <h2 className="font-display text-step-2 text-whitewash">{active.title}</h2>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="shrink-0 text-whitewash hover:text-brass"
              >
                <span className="sr-only">Close</span>
                <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden>
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {active.source === 'YOUTUBE' && active.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <video src={active.fileUrl ?? ''} controls autoPlay playsInline className="h-full w-full">
                  Your browser cannot play this video.
                </video>
              )}
            </div>

            {active.description && (
              <p className="mt-4 max-w-prose text-step--1 text-whitewash/75">{active.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
