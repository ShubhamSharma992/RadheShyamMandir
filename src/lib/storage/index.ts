import 'server-only'
import { cloudinaryProvider } from './cloudinary'
import { localProvider } from './local'
import type { StorageProvider } from './types'

export type { StoredFile, UploadInput, StorageProvider } from './types'

/**
 * Add a provider by writing a file next to cloudinary.ts that satisfies
 * StorageProvider, then registering it here. Rows already in MediaAsset keep
 * working because each one records the provider that stored it.
 */
const providers: Record<string, StorageProvider> = {
  cloudinary: cloudinaryProvider,
  local: localProvider,
  // s3: s3Provider,
  // supabase: supabaseProvider,
}

export function storage(name = process.env.STORAGE_PROVIDER ?? 'cloudinary'): StorageProvider {
  const provider = providers[name]
  if (!provider) {
    throw new Error(
      `Unknown STORAGE_PROVIDER "${name}". Available: ${Object.keys(providers).join(', ')}`,
    )
  }
  return provider
}

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const

export function maxBytes(kind: 'IMAGE' | 'VIDEO') {
  const mb = kind === 'VIDEO' ? Number(process.env.MAX_VIDEO_MB ?? 200) : Number(process.env.MAX_IMAGE_MB ?? 8)
  return mb * 1024 * 1024
}

export function validateFile(file: File): { ok: true; kind: 'IMAGE' | 'VIDEO' } | { ok: false; error: string } {
  const isImage = (IMAGE_TYPES as readonly string[]).includes(file.type)
  const isVideo = (VIDEO_TYPES as readonly string[]).includes(file.type)

  if (!isImage && !isVideo) {
    return { ok: false, error: `${file.name} is not a supported format. Use JPG, PNG, WEBP, MP4, WEBM or MOV.` }
  }

  const kind = isVideo ? 'VIDEO' : 'IMAGE'
  const limit = maxBytes(kind)
  if (file.size > limit) {
    return {
      ok: false,
      error: `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${limit / 1024 / 1024} MB.`,
    }
  }

  return { ok: true, kind }
}
