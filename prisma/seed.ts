import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Seeds the structural rows a fresh install needs: categories, albums,
 * timings and a placeholder TempleInfo row.
 *
 * It deliberately does NOT invent a temple name, a presiding deity, or any
 * history. Those are facts about a real place. Fill them in from the
 * committee via /admin/temple.
 */
async function main() {
  const categories = [
    { name: 'Puja', slug: 'puja', color: '#B1332E', sortOrder: 1 },
    { name: 'Festival', slug: 'festival', color: '#E0A128', sortOrder: 2 },
    { name: 'Bhajan', slug: 'bhajan', color: '#2F5D4A', sortOrder: 3 },
    { name: 'Kirtan', slug: 'kirtan', color: '#5B4B8A', sortOrder: 4 },
    { name: 'Bhandara', slug: 'bhandara', color: '#B47C14', sortOrder: 5 },
    { name: 'Religious ceremony', slug: 'ceremony', color: '#8C2622', sortOrder: 6 },
    { name: 'Community event', slug: 'community', color: '#2F6D7A', sortOrder: 7 },
    { name: 'Special event', slug: 'special', color: '#7A4B2F', sortOrder: 8 },
  ]

  for (const category of categories) {
    await prisma.eventCategory.upsert({ where: { slug: category.slug }, create: category, update: {} })
  }

  const albums = [
    { name: 'The temple', slug: 'temple', sortOrder: 1 },
    { name: 'Festivals', slug: 'festivals', sortOrder: 2 },
    { name: 'Puja', slug: 'puja', sortOrder: 3 },
    { name: 'Community', slug: 'community', sortOrder: 4 },
  ]

  for (const album of albums) {
    await prisma.album.upsert({ where: { slug: album.slug }, create: album, update: {} })
  }

  // Placeholder timings — replace with the committee's actual schedule.
  if ((await prisma.templeTiming.count()) === 0) {
    await prisma.templeTiming.createMany({
      data: [
        { label: 'Morning darshan', labelHi: 'प्रातः दर्शन', opensAt: '05:30', closesAt: '11:30', sortOrder: 1 },
        { label: 'Evening darshan', labelHi: 'सायं दर्शन', opensAt: '16:00', closesAt: '20:30', sortOrder: 2 },
      ],
    })
  }

  await prisma.templeInfo.upsert({
    where: { id: 'temple' },
    create: {
      id: 'temple',
      // Placeholder. Set the real name at /admin/temple before going live.
      name: 'Shree Shree Radhey Shyam Mandir, Ratouli',
      welcomeHeading: 'Welcome',
      welcomeBody:
        'A place of faith, devotion, tradition and community for the village of Ratouli.\n\n' +
        'Replace this text from the admin panel with words the committee chooses.',
      addressLine: 'Village Ratouli',
      district: 'Yamunanagar',
      state: 'Haryana',
      pincode: '135003',
      country: 'India',
    },
    update: {},
  })

  // First administrator, from env. Skipped if either variable is missing.
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email: email.toLowerCase() },
      create: {
        email: email.toLowerCase(),
        name: process.env.SEED_ADMIN_NAME ?? 'Temple committee',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'ADMIN',
      },
      update: {},
    })
    console.log(`Administrator ready: ${email}`)
  } else {
    console.log('No SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD set. Run: npm run admin:create')
  }

  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
