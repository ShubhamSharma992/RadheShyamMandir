'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Uploaded = { id: string; url: string; thumbnailUrl?: string | null; title?: string | null; kind: string }

/**
 * Drag-and-drop uploader with per-file progress. Uses XMLHttpRequest rather
 * than fetch because fetch still gives no upload progress events, and on a
 * village connection a 30 MB video upload without a progress bar feels broken.
 */
export function Uploader({
  albumId,
  eventId,
  onUploaded,
}: {
  albumId?: string
  eventId?: string
  onUploaded?: (assets: Uploaded[]) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [recent, setRecent] = useState<Uploaded[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const send = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files)
      if (list.length === 0) return

      const body = new FormData()
      for (const file of list) body.append('files', file)
      if (albumId) body.append('albumId', albumId)
      if (eventId) body.append('eventId', eventId)

      setErrors([])
      setProgress(0)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/media/upload')

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      })

      xhr.addEventListener('load', () => {
        setProgress(null)
        try {
          const data = JSON.parse(xhr.responseText)
          if (data.failed?.length) setErrors(data.failed.map((f: { error: string }) => f.error))
          if (data.uploaded?.length) {
            setRecent((prev) => [...data.uploaded, ...prev].slice(0, 12))
            onUploaded?.(data.uploaded)
            router.refresh()
          }
        } catch {
          setErrors(['The upload did not complete. Check your connection and try again.'])
        }
      })

      xhr.addEventListener('error', () => {
        setProgress(null)
        setErrors(['The upload did not complete. Check your connection and try again.'])
      })

      xhr.send(body)
    },
    [albumId, eventId, onUploaded, router],
  )

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          send(e.dataTransfer.files)
        }}
        className={[
          'border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragging ? 'border-sindoor bg-sindoor-tint' : 'border-bark/25',
        ].join(' ')}
      >
        <p className="font-display text-step-1">Drop photos or videos here</p>
        <p className="mt-1 text-step--1 text-bark-muted">
          JPG, PNG or WEBP up to 8 MB. MP4, WEBM or MOV up to 200 MB.
        </p>

        <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost mt-5">
          Choose files
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(e) => e.target.files && send(e.target.files)}
        />

        {progress !== null && (
          <div className="mx-auto mt-6 max-w-sm">
            <div className="h-1.5 w-full bg-bark/10">
              <div className="h-full bg-sindoor transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-step--1 tabular-nums text-bark-muted">Uploading… {progress}%</p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="mt-4 space-y-1 border-l-2 border-sindoor bg-sindoor-tint px-4 py-3 text-step--1 text-sindoor-deep">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}

      {recent.length > 0 && (
        <div className="mt-6">
          <p className="text-step--1 text-bark-muted">Just uploaded</p>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {recent.map((asset) => (
              <li key={asset.id} className="aspect-square overflow-hidden bg-parchment">
                {asset.kind === 'IMAGE' ? (
                  <Image
                    src={asset.thumbnailUrl ?? asset.url}
                    alt=""
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-step--1 text-bark-muted">Video</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
