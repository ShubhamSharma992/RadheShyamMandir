'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { audit, destroySession, requireAdmin } from '@/lib/auth'
import { storage } from '@/lib/storage'
import { announcementSchema, eventSchema, templeInfoSchema, videoSchema } from '@/lib/validations'
import { slugify, youtubeId, youtubeThumb } from '@/lib/utils'

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string[]> }

/** Pages that show event or announcement data and need to update immediately. */
function revalidateContent(slug?: string) {
  revalidatePath('/')
  revalidatePath('/events')
  revalidatePath('/calendar')
  if (slug) revalidatePath(`/events/${slug}`)
}

export async function logout() {
  destroySession()
  redirect('/admin/login')
}

// ---------------------------------------------------------------- events

async function uniqueSlug(base: string, excludeId?: string) {
  let candidate = base
  let n = 1
  while (true) {
    const clash = await prisma.event.findFirst({ where: { slug: candidate, NOT: excludeId ? { id: excludeId } : undefined } })
    if (!clash) return candidate
    candidate = `${base}-${++n}`
  }
}

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin()

  const id = formData.get('id') ? String(formData.get('id')) : null
  const raw = Object.fromEntries(formData)
  const parsed = eventSchema.safeParse({
    ...raw,
    allDay: formData.get('allDay') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
    endDate: raw.endDate || null,
    mediaIds: formData.getAll('mediaIds').map(String),
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors, message: 'Some fields need attention.' }
  }

  const d = parsed.data
  const slug = await uniqueSlug(d.slug || slugify(d.title), id ?? undefined)

  // Only one event can be featured at a time.
  if (d.isFeatured) {
    await prisma.event.updateMany({ where: { isFeatured: true, NOT: id ? { id } : undefined }, data: { isFeatured: false } })
  }

  const data = {
    title: d.title,
    titleHi: d.titleHi || null,
    slug,
    summary: d.summary || null,
    description: d.description,
    startDate: d.startDate,
    endDate: d.endDate ?? null,
    startTime: d.allDay ? null : d.startTime || null,
    endTime: d.allDay ? null : d.endTime || null,
    allDay: d.allDay,
    location: d.location,
    organizer: d.organizer || null,
    contactName: d.contactName || null,
    contactPhone: d.contactPhone || null,
    registrationUrl: d.registrationUrl || null,
    registrationNote: d.registrationNote || null,
    categoryId: d.categoryId || null,
    coverImageId: d.coverImageId || null,
    isFeatured: d.isFeatured,
    status: d.status,
    publishedAt: d.status === 'PUBLISHED' ? new Date() : null,
  }

  const event = id
    ? await prisma.event.update({ where: { id }, data })
    : await prisma.event.create({ data: { ...data, authorId: session.sub } })

  if (d.mediaIds.length > 0) {
    await prisma.mediaAsset.updateMany({ where: { id: { in: d.mediaIds } }, data: { eventId: event.id } })
  }

  await audit(session.sub, id ? 'updated' : 'created', 'Event', event.id, event.title)
  revalidateContent(event.slug)
  redirect(`/admin/events?saved=${event.id}`)
}

export async function deleteEvent(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))

  const event = await prisma.event.findUnique({ where: { id }, select: { title: true, slug: true } })
  // Media is detached rather than deleted — the photographs usually outlive
  // the event record and belong in the gallery.
  await prisma.mediaAsset.updateMany({ where: { eventId: id }, data: { eventId: null } })
  await prisma.event.delete({ where: { id } })

  await audit(session.sub, 'deleted', 'Event', id, event?.title)
  revalidateContent(event?.slug)
  revalidatePath('/admin/events')
}

export async function toggleEventFlag(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  const field = String(formData.get('field')) as 'status' | 'isFeatured'

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return

  if (field === 'status') {
    const status = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    await prisma.event.update({
      where: { id },
      data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : null },
    })
    await audit(session.sub, status === 'PUBLISHED' ? 'published' : 'unpublished', 'Event', id, event.title)
  } else {
    if (!event.isFeatured) await prisma.event.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } })
    await prisma.event.update({ where: { id }, data: { isFeatured: !event.isFeatured } })
    await audit(session.sub, 'updated', 'Event', id, `featured: ${!event.isFeatured}`)
  }

  revalidateContent(event.slug)
  revalidatePath('/admin/events')
}

// ---------------------------------------------------------- announcements

export async function saveAnnouncement(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin()
  const id = formData.get('id') ? String(formData.get('id')) : null
  const raw = Object.fromEntries(formData)

  const parsed = announcementSchema.safeParse({
    ...raw,
    startsAt: raw.startsAt || new Date(),
    expiresAt: raw.expiresAt || null,
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors, message: 'Some fields need attention.' }
  }

  const d = parsed.data
  const data = {
    title: d.title,
    titleHi: d.titleHi || null,
    body: d.body,
    startsAt: d.startsAt,
    expiresAt: d.expiresAt ?? null,
    priority: d.priority,
    status: d.status,
    linkUrl: d.linkUrl || null,
  }

  const saved = id
    ? await prisma.announcement.update({ where: { id }, data })
    : await prisma.announcement.create({ data: { ...data, authorId: session.sub } })

  await audit(session.sub, id ? 'updated' : 'created', 'Announcement', saved.id, saved.title)
  revalidatePath('/')
  revalidatePath('/admin/announcements')
  return { ok: true, message: id ? 'Announcement updated.' : 'Announcement created.' }
}

export async function deleteAnnouncement(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  await prisma.announcement.delete({ where: { id } })
  await audit(session.sub, 'deleted', 'Announcement', id)
  revalidatePath('/')
  revalidatePath('/admin/announcements')
}

// ----------------------------------------------------------------- media

export async function updateMedia(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  await prisma.mediaAsset.update({
    where: { id },
    data: {
      title: String(formData.get('title') ?? '') || null,
      caption: String(formData.get('caption') ?? '') || null,
      altText: String(formData.get('altText') ?? '') || null,
      albumId: String(formData.get('albumId') ?? '') || null,
      isFeatured: formData.get('isFeatured') === 'on',
    },
  })
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
}

export async function deleteMedia(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))

  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) return

  // Remove the row first; an orphaned file is a smaller problem than a
  // gallery entry pointing at a file that no longer exists.
  await prisma.mediaAsset.delete({ where: { id } })
  try {
    await storage(asset.provider).remove(asset.storageKey, asset.kind)
  } catch (error) {
    console.error('Storage delete failed, file may be orphaned:', asset.storageKey, error)
  }

  await audit(session.sub, 'deleted', 'MediaAsset', id, asset.title ?? undefined)
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
}

export async function saveVideo(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin()
  const parsed = videoSchema.safeParse({
    ...Object.fromEntries(formData),
    isFeatured: formData.get('isFeatured') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors, message: 'Some fields need attention.' }
  }

  const d = parsed.data
  const ytId = d.source === 'YOUTUBE' && d.youtubeUrl ? youtubeId(d.youtubeUrl) : null

  if (d.source === 'YOUTUBE' && !ytId) {
    return { ok: false, errors: { youtubeUrl: ['That does not look like a YouTube link.'] } }
  }

  const video = await prisma.video.create({
    data: {
      title: d.title,
      description: d.description || null,
      source: d.source,
      youtubeId: ytId,
      fileUrl: d.source === 'UPLOAD' ? d.fileUrl || null : null,
      thumbnailUrl: ytId ? youtubeThumb(ytId) : null,
      eventId: d.eventId || null,
      status: d.status,
      isFeatured: d.isFeatured,
    },
  })

  await audit(session.sub, 'created', 'Video', video.id, video.title)
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
  return { ok: true, message: 'Video added.' }
}

export async function deleteVideo(formData: FormData) {
  const session = await requireAdmin()
  const id = String(formData.get('id'))
  await prisma.video.delete({ where: { id } })
  await audit(session.sub, 'deleted', 'Video', id)
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
}

// ------------------------------------------------------------ temple info

export async function saveTempleInfo(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin()
  const raw = Object.fromEntries(formData)

  const parsed = templeInfoSchema.safeParse({
    ...raw,
    latitude: raw.latitude || null,
    longitude: raw.longitude || null,
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors, message: 'Some fields need attention.' }
  }

  const d = parsed.data
  const data = {
    ...d,
    tagline: d.tagline || null,
    welcomeHeading: d.welcomeHeading || null,
    welcomeBody: d.welcomeBody || null,
    introduction: d.introduction || null,
    history: d.history || null,
    significance: d.significance || null,
    community: d.community || null,
    traditions: d.traditions || null,
    mapsPlaceUrl: d.mapsPlaceUrl || null,
    phone: d.phone || null,
    email: d.email || null,
    whatsapp: d.whatsapp || null,
    facebookUrl: d.facebookUrl || null,
    instagramUrl: d.instagramUrl || null,
    youtubeUrl: d.youtubeUrl || null,
    heroImageUrl: d.heroImageUrl || null,
  }

  await prisma.templeInfo.upsert({ where: { id: 'temple' }, create: { id: 'temple', ...data }, update: data })

  await audit(session.sub, 'updated', 'TempleInfo', 'temple')
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Temple information saved.' }
}

export async function markMessageRead(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  await prisma.contactMessage.update({ where: { id }, data: { isRead: true } })
  revalidatePath('/admin/messages')
}
