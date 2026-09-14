import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(input: string) {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

const IST = 'Asia/Kolkata'

/** Dates are stored as calendar dates; always render them in IST. */
export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: IST,
    ...opts,
  }).format(d)
}

export function formatDateRange(start: Date, end?: Date | null) {
  if (!end || start.toDateString() === end.toDateString()) return formatDate(start)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) {
    return `${new Intl.DateTimeFormat('en-IN', { day: 'numeric', timeZone: IST }).format(start)}–${formatDate(end)}`
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}

/** "17:30" -> "5:30 pm" */
export function formatTime(hhmm?: string | null) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return null
  const period = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${period}`
}

export function formatTimeRange(start?: string | null, end?: string | null) {
  const s = formatTime(start)
  if (!s) return null
  const e = formatTime(end)
  return e ? `${s} – ${e}` : s
}

/** Current wall-clock minutes-since-midnight in IST, wherever the server is. */
export function istNowMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: IST,
  }).format(now)
  const [h, m] = parts.split(':').map(Number)
  return h * 60 + m
}

export function istDayOfWeek(now = new Date()) {
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: IST }).format(now)
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day) + 1
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

/** Accepts a full YouTube URL or a bare id and returns the id. */
export function youtubeId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return match ? match[1] : null
}

export function youtubeThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}
