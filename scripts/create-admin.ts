/**
 * Creates an administrator account interactively:
 *   npm run admin:create
 * The password is read from stdin and never written to shell history.
 */
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })

  const email = (await rl.question('Email address: ')).trim().toLowerCase()
  const name = (await rl.question('Name: ')).trim()
  const password = (await rl.question('Password (at least 12 characters): ')).trim()
  rl.close()

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('That is not a valid email address.')
  if (password.length < 12) throw new Error('Use at least 12 characters.')

  const user = await prisma.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' },
    update: { passwordHash: await bcrypt.hash(password, 12), name, isActive: true },
  })

  console.log(`\nAdministrator ready: ${user.email}\nSign in at /admin/login`)
}

main()
  .catch((error) => {
    console.error(`\n${error.message}`)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
