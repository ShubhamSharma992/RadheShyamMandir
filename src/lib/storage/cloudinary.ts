import crypto from 'node:crypto'
import type { StorageProvider, StoredFile, UploadInput } from './types'

/**
 * Signed direct upload via Cloudinary's REST API — no SDK dependency.
 * Cloudinary handles transcoding and derivative generation, which is why
 * it's the default for a site whose editors are uploading phone photos.
 */
function env(key: string) {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key}. Set it in .env or switch STORAGE_PROVIDER.`)
  return value
}

function sign(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')
}

export const cloudinaryProvider: StorageProvider = {
  name: 'cloudinary',

  async upload({ file, folder, kind }: UploadInput): Promise<StoredFile> {
    const cloud = env('CLOUDINARY_CLOUD_NAME')
    const apiKey = env('CLOUDINARY_API_KEY')
    const apiSecret = env('CLOUDINARY_API_SECRET')
    const targetFolder = [process.env.CLOUDINARY_FOLDER ?? 'temple', folder].filter(Boolean).join('/')

    const timestamp = String(Math.floor(Date.now() / 1000))
    const signedParams: Record<string, string> = { folder: targetFolder, timestamp }
    if (kind === 'IMAGE') {
      // Strip EXIF (phone photos carry GPS) and cap the stored original.
      signedParams.transformation = 'c_limit,w_2400,q_auto:good'
    }

    const form = new FormData()
    form.append('file', file)
    for (const [k, v] of Object.entries(signedParams)) form.append(k, v)
    form.append('api_key', apiKey)
    form.append('signature', sign(signedParams, apiSecret))

    const resourceType = kind === 'VIDEO' ? 'video' : 'image'
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
      { method: 'POST', body: form },
    )

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Cloudinary upload failed (${response.status}): ${detail.slice(0, 300)}`)
    }

    const data = (await response.json()) as Record<string, any>

    return {
      provider: 'cloudinary',
      storageKey: data.public_id,
      url: data.secure_url,
      thumbnailUrl:
        kind === 'VIDEO'
          ? data.secure_url.replace(/\.[^./]+$/, '.jpg')
          : cloudinaryProvider.derive(data.secure_url, { width: 640 }),
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      mimeType: file.type,
    }
  },

  async remove(storageKey, kind) {
    const cloud = env('CLOUDINARY_CLOUD_NAME')
    const apiKey = env('CLOUDINARY_API_KEY')
    const apiSecret = env('CLOUDINARY_API_SECRET')
    const timestamp = String(Math.floor(Date.now() / 1000))
    const params = { public_id: storageKey, timestamp }

    const form = new FormData()
    form.append('public_id', storageKey)
    form.append('timestamp', timestamp)
    form.append('api_key', apiKey)
    form.append('signature', sign(params, apiSecret))

    await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${kind === 'VIDEO' ? 'video' : 'image'}/destroy`,
      { method: 'POST', body: form },
    )
  },

  derive(url, { width, quality }) {
    return url.replace('/upload/', `/upload/c_limit,w_${width},q_${quality ?? 'auto:good'},f_auto/`)
  },
}
