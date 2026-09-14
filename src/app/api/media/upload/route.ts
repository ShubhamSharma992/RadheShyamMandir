import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { audit, requireAdmin } from '@/lib/auth'
import { storage, validateFile } from '@/lib/storage'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Admin-only upload endpoint. Middleware guards /api/admin, but this route
 * sits under /api/media, so it checks the session itself.
 */
export async function POST(request: NextRequest) {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Sign in to upload files.' }, { status: 401 })
  }

  // Same-origin check: server actions get this for free, route handlers don't.
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Request blocked.' }, { status: 403 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files').filter((f): f is File => f instanceof File)
  const albumId = formData.get('albumId') ? String(formData.get('albumId')) : null
  const eventId = formData.get('eventId') ? String(formData.get('eventId')) : null

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files were included.' }, { status: 400 })
  }

  const provider = storage()
  const uploaded = []
  const failed = []

  for (const file of files) {
    const check = validateFile(file)
    if (!check.ok) {
      failed.push({ name: file.name, error: check.error })
      continue
    }

    try {
      const stored = await provider.upload({
        file,
        kind: check.kind,
        folder: check.kind === 'VIDEO' ? 'videos' : 'photos',
      })

      const asset = await prisma.mediaAsset.create({
        data: {
          kind: check.kind,
          provider: stored.provider,
          storageKey: stored.storageKey,
          url: stored.url,
          thumbnailUrl: stored.thumbnailUrl ?? null,
          width: stored.width ?? null,
          height: stored.height ?? null,
          bytes: stored.bytes ?? null,
          mimeType: stored.mimeType ?? null,
          title: file.name.replace(/\.[^.]+$/, ''),
          albumId,
          eventId,
          uploadedById: session.sub,
        },
      })

      uploaded.push(asset)
      await audit(session.sub, 'uploaded', 'MediaAsset', asset.id, file.name)
    } catch (error) {
      console.error('Upload failed:', file.name, error)
      failed.push({ name: file.name, error: 'Upload failed. Try again, or use a smaller file.' })
    }
  }

  return NextResponse.json({ uploaded, failed }, { status: failed.length && !uploaded.length ? 400 : 200 })
}
