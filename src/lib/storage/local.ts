import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import type { StorageProvider, StoredFile, UploadInput } from './types'

/**
 * Writes to public/uploads. Use for local development only — it does not
 * survive a redeploy on Vercel or any container platform.
 */
const ROOT = path.join(process.cwd(), 'public', 'uploads')

export const localProvider: StorageProvider = {
  name: 'local',

  async upload({ file, folder }: UploadInput): Promise<StoredFile> {
    const dir = path.join(ROOT, folder ?? '')
    await mkdir(dir, { recursive: true })

    const ext = path.extname(file.name) || ''
    const key = path.join(folder ?? '', `${crypto.randomUUID()}${ext}`)
    await writeFile(path.join(ROOT, key), Buffer.from(await file.arrayBuffer()))

    const url = `/uploads/${key.split(path.sep).join('/')}`
    return {
      provider: 'local',
      storageKey: key,
      url,
      thumbnailUrl: url,
      bytes: file.size,
      mimeType: file.type,
    }
  },

  async remove(storageKey) {
    await unlink(path.join(ROOT, storageKey)).catch(() => {})
  },

  derive(url) {
    return url
  },
}
