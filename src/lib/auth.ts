import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export const SESSION_COOKIE = 'temple_session'

function secret() {
  const value = process.env.AUTH_SECRET
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET is missing or too short. Generate one with: openssl rand -base64 48')
  }
  return new TextEncoder().encode(value)
}

function maxAgeSeconds() {
  return Number(process.env.SESSION_MAX_AGE_HOURS ?? 12) * 3600
}

export type SessionPayload = {
  sub: string
  email: string
  name: string
  role: Role
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}

export async function createSession(user: SessionPayload) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds()}s`)
    .sign(secret())

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds(),
  })
}

export function destroySession() {
  cookies().delete(SESSION_COOKIE)
}

/** Edge-safe: used by middleware as well as server components. */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] })
    if (!payload.sub) return null
    return {
      sub: payload.sub,
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Use at the top of every admin server action and page. Middleware is a
 * first gate, not the only one — the check has to also live next to the data.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHENTICATED')

  const user = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { isActive: true },
  })
  if (!user?.isActive) throw new Error('UNAUTHENTICATED')

  return session
}

export async function requireRole(role: Role) {
  const session = await requireAdmin()
  if (role === 'ADMIN' && session.role !== 'ADMIN') throw new Error('FORBIDDEN')
  return session
}

// --- login ------------------------------------------------------------

/**
 * Simple in-process throttle. Fine for one village temple on a single
 * instance; swap for Redis/Upstash if you ever run more than one.
 */
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

export function throttle(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }
  entry.count += 1
  return { allowed: entry.count <= MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - entry.count) }
}

export function clearThrottle(key: string) {
  attempts.delete(key)
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })

  // Always run a hash comparison so a missing account and a wrong password
  // take the same amount of time.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid'
  const ok = await bcrypt.compare(password, hash)

  if (!user || !user.isActive || !ok) return null

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return { sub: user.id, email: user.email, name: user.name, role: user.role } satisfies SessionPayload
}

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  summary?: string,
) {
  await prisma.auditLog.create({ data: { actorId, action, entityType, entityId, summary } })
}
