export type UploadInput = {
  file: File
  folder?: string
  /** Hint only; the provider decides what it can actually do. */
  kind: 'IMAGE' | 'VIDEO'
}

export type StoredFile = {
  provider: string
  storageKey: string
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  bytes?: number
  mimeType?: string
}

/**
 * Every provider implements exactly this. Nothing outside src/lib/storage
 * imports a vendor SDK, so swapping Cloudinary for S3 is a one-line change
 * in index.ts plus new env vars — no schema migration, no component edits.
 */
export interface StorageProvider {
  readonly name: string
  upload(input: UploadInput): Promise<StoredFile>
  remove(storageKey: string, kind: 'IMAGE' | 'VIDEO'): Promise<void>
  /** Optional on-the-fly resize. Providers that can't do it return the original. */
  derive(url: string, opts: { width: number; quality?: number }): string
}
