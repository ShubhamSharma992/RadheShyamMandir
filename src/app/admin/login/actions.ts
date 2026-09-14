'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearThrottle, createSession, throttle, verifyCredentials } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'Enter your email address and password.' }
  }

  const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${ip}:${parsed.data.email}`

  if (!throttle(key).allowed) {
    return { error: 'Too many attempts. Wait fifteen minutes and try again.' }
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password)
  if (!user) {
    // Deliberately does not say which of the two was wrong.
    return { error: 'That email address and password do not match.' }
  }

  clearThrottle(key)
  await createSession(user)

  const next = String(formData.get('next') ?? '/admin')
  redirect(next.startsWith('/admin') ? next : '/admin')
}
