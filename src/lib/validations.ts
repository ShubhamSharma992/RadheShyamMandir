import { z } from 'zod'

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour time, like 05:30')

const optionalString = z.string().trim().max(200).optional().or(z.literal('')).transform((v) => v || undefined)

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, 'Give the event a title').max(140),
    titleHi: optionalString,
    slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only').optional(),
    summary: z.string().trim().max(280, 'Keep the summary under 280 characters').optional().or(z.literal('')),
    description: z.string().trim().min(10, 'Add a description so visitors know what to expect'),

    startDate: z.coerce.date({ required_error: 'Pick a start date' }),
    endDate: z.coerce.date().optional().nullable(),
    startTime: hhmm.optional().or(z.literal('')),
    endTime: hhmm.optional().or(z.literal('')),
    allDay: z.coerce.boolean().default(false),

    location: z.string().trim().min(2).max(160).default('Village Temple, Ratouli'),
    organizer: optionalString,
    contactName: optionalString,
    contactPhone: z
      .string()
      .trim()
      .regex(/^[+]?[\d\s-]{7,15}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    registrationUrl: z.string().trim().url('Enter a full URL starting with https://').optional().or(z.literal('')),
    registrationNote: z.string().trim().max(300).optional().or(z.literal('')),

    categoryId: z.string().cuid().optional().or(z.literal('')),
    coverImageId: z.string().cuid().optional().or(z.literal('')),
    mediaIds: z.array(z.string().cuid()).default([]),

    isFeatured: z.coerce.boolean().default(false),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  })
  .refine((d) => !d.endDate || d.endDate >= d.startDate, {
    message: 'The end date cannot be before the start date',
    path: ['endDate'],
  })
  .refine((d) => !d.startTime || !d.endTime || d.endTime > d.startTime || (d.endDate && d.endDate > d.startDate), {
    message: 'The end time cannot be before the start time',
    path: ['endTime'],
  })

export const announcementSchema = z
  .object({
    title: z.string().trim().min(3, 'Give the announcement a title').max(140),
    titleHi: optionalString,
    body: z.string().trim().min(5, 'Write the announcement'),
    startsAt: z.coerce.date().default(() => new Date()),
    expiresAt: z.coerce.date().optional().nullable(),
    priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).default('NORMAL'),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    linkUrl: z.string().trim().url().optional().or(z.literal('')),
  })
  .refine((d) => !d.expiresAt || d.expiresAt > d.startsAt, {
    message: 'The expiry date has to be after the start date',
    path: ['expiresAt'],
  })

export const videoSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    source: z.enum(['YOUTUBE', 'UPLOAD']).default('YOUTUBE'),
    youtubeUrl: z.string().trim().optional().or(z.literal('')),
    fileUrl: z.string().trim().optional().or(z.literal('')),
    eventId: z.string().cuid().optional().or(z.literal('')),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
    isFeatured: z.coerce.boolean().default(false),
  })
  .refine((d) => (d.source === 'YOUTUBE' ? !!d.youtubeUrl : !!d.fileUrl), {
    message: 'Add a YouTube link, or upload a video file',
    path: ['youtubeUrl'],
  })

export const templeInfoSchema = z.object({
  name: z.string().trim().min(2, 'The temple name is required').max(120),
  nameHi: optionalString,
  tagline: z.string().trim().max(160).optional().or(z.literal('')),
  welcomeHeading: z.string().trim().max(160).optional().or(z.literal('')),
  welcomeBody: z.string().trim().max(2000).optional().or(z.literal('')),
  introduction: z.string().trim().max(5000).optional().or(z.literal('')),
  history: z.string().trim().max(20000).optional().or(z.literal('')),
  significance: z.string().trim().max(5000).optional().or(z.literal('')),
  community: z.string().trim().max(5000).optional().or(z.literal('')),
  traditions: z.string().trim().max(5000).optional().or(z.literal('')),
  addressLine: z.string().trim().min(2).max(160),
  district: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, 'A PIN code is six digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  mapsPlaceUrl: z.string().trim().url().optional().or(z.literal('')),
  phone: z.string().trim().regex(/^[+]?[\d\s-]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  whatsapp: z.string().trim().optional().or(z.literal('')),
  facebookUrl: z.string().trim().url().optional().or(z.literal('')),
  instagramUrl: z.string().trim().url().optional().or(z.literal('')),
  youtubeUrl: z.string().trim().url().optional().or(z.literal('')),
  heroImageUrl: z.string().trim().optional().or(z.literal('')),
})

export const timingSchema = z.object({
  label: z.string().trim().min(2).max(80),
  labelHi: optionalString,
  dayOfWeek: z.coerce.number().int().min(0).max(7).default(0),
  opensAt: hhmm,
  closesAt: hhmm,
  note: z.string().trim().max(160).optional().or(z.literal('')),
})

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z.string().trim().regex(/^[+]?[\d\s-]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  subject: z.string().trim().max(140).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please write your message').max(2000),
  /** Hidden field. Bots fill it in; people never see it. */
  website: z.string().max(0).optional(),
})

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a colour'),
})

export type EventInput = z.infer<typeof eventSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
export type TempleInfoInput = z.infer<typeof templeInfoSchema>
