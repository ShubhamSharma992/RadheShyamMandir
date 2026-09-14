'use server'

import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validations'

export type ContactState = { status: 'idle' | 'sent' | 'error'; errors?: Record<string, string[]>; message?: string }

/** Crude per-process throttle so the form can't be used as a spam relay. */
const recent = new Map<string, number>()

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { status: 'error', errors: parsed.error.flatten().fieldErrors }
  }

  // Honeypot: a real person never fills this in.
  if (parsed.data.website) return { status: 'sent' }

  const fingerprint = `${parsed.data.email ?? ''}|${parsed.data.phone ?? ''}`
  const last = recent.get(fingerprint)
  if (last && Date.now() - last < 60_000) {
    return { status: 'error', message: 'That message has already been sent. Please wait a minute before sending another.' }
  }
  recent.set(fingerprint, Date.now())

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    },
  })

  return { status: 'sent' }
}
