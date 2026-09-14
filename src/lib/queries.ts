import 'server-only'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { istDayOfWeek, istNowMinutes, toMinutes } from '@/lib/utils'

/** Midnight today, in IST, as a Date usable against @db.Date columns. */
export function todayIST() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  return new Date(`${parts}T00:00:00.000Z`)
}

const eventCard = {
  id: true,
  title: true,
  titleHi: true,
  slug: true,
  summary: true,
  startDate: true,
  endDate: true,
  startTime: true,
  endTime: true,
  allDay: true,
  location: true,
  isFeatured: true,
  category: { select: { name: true, slug: true, color: true } },
  coverImage: { select: { url: true, thumbnailUrl: true, altText: true, width: true, height: true } },
} as const

export const getTempleInfo = cache(async () => {
  return prisma.templeInfo.findUnique({ where: { id: 'temple' } })
})

export const getTimings = cache(async () => {
  return prisma.templeTiming.findMany({ orderBy: [{ sortOrder: 'asc' }, { opensAt: 'asc' }] })
})

/**
 * Works out whether the temple is open right now, and if not, when it next
 * opens. All comparisons are in IST wall-clock minutes.
 */
export async function getDarshanStatus() {
  const timings = await getTimings()
  if (timings.length === 0) return null

  const today = istDayOfWeek()
  const now = istNowMinutes()
  const applicable = timings
    .filter((t) => t.dayOfWeek === 0 || t.dayOfWeek === today)
    .sort((a, b) => toMinutes(a.opensAt) - toMinutes(b.opensAt))

  const current = applicable.find((t) => now >= toMinutes(t.opensAt) && now < toMinutes(t.closesAt))
  if (current) return { open: true as const, label: current.label, until: current.closesAt }

  const next = applicable.find((t) => toMinutes(t.opensAt) > now) ?? applicable[0]
  return {
    open: false as const,
    label: next?.label ?? null,
    next: next?.opensAt ?? null,
    tomorrow: !applicable.some((t) => toMinutes(t.opensAt) > now),
  }
}

export async function getUpcomingEvents(take = 5) {
  return prisma.event.findMany({
    where: { status: 'PUBLISHED', OR: [{ startDate: { gte: todayIST() } }, { endDate: { gte: todayIST() } }] },
    orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
    take,
    select: eventCard,
  })
}

export async function getFeaturedEvent() {
  return prisma.event.findFirst({
    where: { status: 'PUBLISHED', isFeatured: true },
    orderBy: { startDate: 'asc' },
    select: { ...eventCard, description: true },
  })
}

export async function getPastEvents(take = 12, skip = 0) {
  return prisma.event.findMany({
    where: { status: 'PUBLISHED', startDate: { lt: todayIST() } },
    orderBy: { startDate: 'desc' },
    take,
    skip,
    select: eventCard,
  })
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      category: true,
      coverImage: true,
      media: { orderBy: { sortOrder: 'asc' } },
      videos: { where: { status: 'PUBLISHED' } },
    },
  })
}

/** Everything overlapping a calendar month, including multi-day spans. */
export async function getEventsInRange(from: Date, to: Date) {
  return prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { startDate: { gte: from, lte: to } },
        { endDate: { gte: from, lte: to } },
        { AND: [{ startDate: { lte: from } }, { endDate: { gte: to } }] },
      ],
    },
    orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
    select: eventCard,
  })
}

export async function getActiveAnnouncements(take = 5) {
  const now = new Date()
  return prisma.announcement.findMany({
    where: {
      status: 'PUBLISHED',
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ priority: 'desc' }, { startsAt: 'desc' }],
    take,
  })
}

export async function getGalleryImages({
  take = 24,
  skip = 0,
  albumSlug,
  featuredOnly = false,
}: { take?: number; skip?: number; albumSlug?: string; featuredOnly?: boolean } = {}) {
  return prisma.mediaAsset.findMany({
    where: {
      kind: 'IMAGE',
      ...(albumSlug ? { album: { slug: albumSlug } } : {}),
      ...(featuredOnly ? { isFeatured: true } : {}),
    },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    take,
    skip,
    include: { album: { select: { name: true, slug: true } }, event: { select: { title: true, slug: true } } },
  })
}

export async function getAlbums() {
  return prisma.album.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { media: true } } },
  })
}

export async function getVideos(take = 8) {
  return prisma.video.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    take,
    include: { event: { select: { title: true, slug: true } } },
  })
}

export async function getCategories() {
  return prisma.eventCategory.findMany({ orderBy: { sortOrder: 'asc' } })
}

/**
 * Postgres full-text search across the four content types, ranked. Falls back
 * to ILIKE for very short queries where to_tsquery is not much use.
 */
export async function searchEverything(term: string) {
  const q = term.trim()
  if (q.length < 2) return { events: [], announcements: [], media: [], videos: [] }

  const like = `%${q}%`

  const [events, announcements, media, videos] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { titleHi: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { startDate: 'desc' },
      take: 12,
      select: eventCard,
    }),
    prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { startsAt: 'desc' },
      take: 8,
    }),
    prisma.mediaAsset.findMany({
      where: {
        kind: 'IMAGE',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { caption: { contains: q, mode: 'insensitive' } },
          { altText: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.video.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  void like
  return { events, announcements, media, videos }
}

export async function getDashboardStats() {
  const today = todayIST()
  const now = new Date()

  const [events, upcoming, drafts, photos, videos, announcements, unreadMessages, recentUploads, recentLogs] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: 'PUBLISHED', startDate: { gte: today } } }),
      prisma.event.count({ where: { status: 'DRAFT' } }),
      prisma.mediaAsset.count({ where: { kind: 'IMAGE' } }),
      prisma.video.count(),
      prisma.announcement.count({
        where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { actor: { select: { name: true } } },
      }),
    ])

  return { events, upcoming, drafts, photos, videos, announcements, unreadMessages, recentUploads, recentLogs }
}
