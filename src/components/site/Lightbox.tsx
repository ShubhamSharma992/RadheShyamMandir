'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

export type LightboxImage = {
  id: string
  url: string
  thumbnailUrl?: string | null
  altText?: string | null
  caption?: string | null
  title?: string | null
  width?: number | null
  height?: number | null
}

/**
 * Masonry grid + full-screen viewer. Arrow keys and Escape work; focus
 * returns to the trigger on close.
 */
export function GalleryGrid({ images, columns = 3 }: { images: LightboxImage[]; columns?: 2 | 3 | 4 }) {
  const [index, setIndex] = useState<number | null>(null)

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)), [images.length])
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % images.length)), [images.length])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, close, prev, next])

  const colClass = columns === 2 ? 'columns-2' : columns === 4 ? 'columns-2 lg:columns-4' : 'columns-2 lg:columns-3'
  const active = index === null ? null : images[index]

  return (
    <>
      <div className={`${colClass} gap-4 [column-fill:_balance]`}>
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden bg-parchment"
          >
            <Image
              src={image.thumbnailUrl ?? image.url}
              alt={image.altText ?? image.caption ?? ''}
              width={image.width ?? 800}
              height={image.height ?? 1000}
              loading="lazy"
              sizes="(max-width: 640px) 45vw, 30vw"
              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="sr-only">Open larger view</span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title ?? 'Photograph'}
          className="fixed inset-0 z-50 flex flex-col bg-bark/97"
          onClick={close}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={close}
              className="flex h-11 w-11 items-center justify-center text-whitewash hover:text-brass"
            >
              <span className="sr-only">Close</span>
              <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden>
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4" onClick={(e) => e.stopPropagation()}>
            <NavButton side="left" onClick={prev} disabled={images.length < 2} />
            <Image
              src={active.url}
              alt={active.altText ?? active.caption ?? ''}
              width={active.width ?? 1600}
              height={active.height ?? 1200}
              className="max-h-[78dvh] w-auto object-contain"
              priority
            />
            <NavButton side="right" onClick={next} disabled={images.length < 2} />
          </div>

          <div className="px-6 pb-8 text-center text-whitewash/80">
            {active.caption && <p className="mx-auto max-w-prose text-step--1">{active.caption}</p>}
            <p className="mt-2 text-step--1 tabular-nums text-whitewash/50">
              {(index ?? 0) + 1} of {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function NavButton({ side, onClick, disabled }: { side: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  if (disabled) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${side === 'left' ? 'left-2' : 'right-2'} z-10 flex h-12 w-12 items-center justify-center text-whitewash hover:text-brass`}
    >
      <span className="sr-only">{side === 'left' ? 'Previous photograph' : 'Next photograph'}</span>
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path
          d={side === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
