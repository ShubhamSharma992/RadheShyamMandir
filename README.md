# Temple website — Village Ratouli, Yamunanagar, Haryana 135003

A Next.js 14 + PostgreSQL website for a village temple: public pages for visitors, and a protected admin area where the temple committee manages events, photographs, videos, announcements and timings.

---

## Before you go live

Two things in this repository are placeholders, on purpose.

**The temple's name.** The seed sets it to `Village Temple, Ratouli`. Set the real name, and its Devanagari form, at `/admin/temple`.

**The history and significance text.** These fields are empty, and the About page only renders sections that have content. I haven't written a history for this temple, because I don't know it — inventing one would put false claims about a real place on a public website. Get the text from the committee and paste it in.

Darshan timings in the seed (5:30–11:30, 4:00–8:30) are plausible placeholders. Replace them with the real schedule.

---

## Running it locally

```bash
npm install
cp .env.example .env          # then edit it
openssl rand -base64 48       # paste into AUTH_SECRET

docker compose up -d          # or point DATABASE_URL at any Postgres
npm run db:migrate
npm run db:seed
npm run admin:create          # prompts for email, name, password

npm run dev                   # http://localhost:3000
```

Sign in at `/admin/login`.

For local work without a storage account, set `STORAGE_PROVIDER="local"` — files go to `public/uploads`. Don't use that in production; the directory does not survive a redeploy.

---

## How it's put together

```
prisma/schema.prisma     data model
src/lib/                 prisma client, auth, storage, validation, queries
src/lib/storage/         one file per provider behind a shared interface
src/app/                 public pages
src/app/admin/           protected admin area
src/app/admin/actions.ts every admin write, as server actions
src/components/          site/ (public), admin/, home/, ui/
middleware.ts            edge gate on /admin
```

**Data flows one way.** Pages are server components that call `src/lib/queries.ts`. Writes are server actions in `src/app/admin/actions.ts`, which validate with Zod, write through Prisma, and call `revalidatePath` on the affected pages. There is no client-side data fetching and no public write API.

**The database is standalone.** It's reached only through `DATABASE_URL`. Nothing assumes it shares a host with the app, so Neon, Supabase, RDS or a plain Postgres box all work unchanged.

**Media never goes in Postgres.** Files go to the storage provider; `MediaAsset` keeps the URL, thumbnail URL, dimensions, byte size, MIME type and the provider that stored it. Because each row records its own provider, switching providers later doesn't strand the files already uploaded.

### Swapping the storage provider

Write a file in `src/lib/storage/` that satisfies the `StorageProvider` interface (`upload`, `remove`, `derive`), register it in the map in `index.ts`, and change `STORAGE_PROVIDER`. Nothing else in the codebase imports a vendor SDK. Cloudinary and a local-disk provider are included; S3 and Supabase are stubbed in `.env.example` and are each about forty lines.

---

## Security

- Passwords are bcrypt, cost 12. Login compares against a dummy hash when the account doesn't exist, so a wrong email and a wrong password take the same time.
- Sessions are HS256 JWTs in an httpOnly, SameSite=Lax cookie, expiring after `SESSION_MAX_AGE_HOURS`.
- `middleware.ts` verifies the token at the edge before any admin route renders — but it is the first gate, not the only one. Every admin server action and the upload route call `requireAdmin()` independently, which also re-checks that the account is still active. A middleware matcher mistake therefore can't expose data on its own.
- Login is throttled to 8 attempts per IP + email per 15 minutes. That's an in-process map, which is right for a single instance; move it to Redis if you ever run more than one.
- Uploads are validated by MIME type and size on the server, not just in the browser, and Cloudinary strips EXIF (phone photos carry GPS).
- The contact form has a honeypot field and a per-sender cooldown.
- `/admin`, `/api` and `/search` are excluded in `robots.ts`, and admin pages set `noindex`.

**Before deploying:** set a real `AUTH_SECRET`, don't reuse it between environments, and don't commit `.env`.

---

## What the committee can change without a developer

Temple name and Hindi name · hero photograph · welcome text · all five About sections · address, coordinates, maps link · phone, WhatsApp, email, social links · darshan timings · events, with categories, images, videos, draft/published state and which one is featured · announcements with automatic expiry · albums, captions, alt text · YouTube and uploaded videos.

Event categories are rows, not an enum, so new ones can be added without a migration.

---

## Deploying

Frontend on Vercel; database on any managed Postgres; media on Cloudinary.

1. Set every variable from `.env.example` in the hosting dashboard.
2. `npm run build` runs `prisma generate && prisma migrate deploy` before the Next build, so migrations apply on deploy.
3. Add your storage provider's hostname to `images.remotePatterns` in `next.config.mjs` if it isn't already there.
4. Run `npm run db:seed` once against production, then `npm run admin:create`.

Public pages use ISR (`revalidate = 3600` on the home page, 900s on events and the calendar). Admin writes call `revalidatePath`, so published changes show up immediately rather than waiting for the window to lapse.

---

## Design notes

The palette comes from the building materials of a Yamuna-belt village temple: lime whitewash `#F2F4EE`, sindoor `#B1332E`, brass `#E0A128`, tulsi green `#2F5D4A`, and dark door-wood `#1E2A22` for text.

Type is Halant with Mukta. Both cover Devanagari and Latin, so Hindi and English sit together on the page instead of one dropping to a system fallback. Hindi is optional everywhere — fields left blank simply don't render.

The recurring shape is the pointed torana arch, used as a divider and as the image mask on event cards. It's the one deliberately bold element; everything else stays quiet.

Motion is limited to one hero reveal on page load plus responses to what someone does (opening the lightbox, changing month). `prefers-reduced-motion` disables all of it.

The calendar is a month grid on tablet and up and an agenda list on phones — a seven-column grid on a 360px screen gives each day about 45px, which nobody can read.

---

## Known gaps

- **Rich text.** Descriptions are plain text split on blank lines. If the committee wants bold, links or lists, add an editor and store HTML — sanitise it server-side if you do.
- **Media library picker.** The event form shows the 36 most recent images. Past that it needs pagination and search.
- **S3 and Supabase providers.** Interfaces are defined, implementations aren't written.
- **Email notifications.** Contact messages land in `/admin/messages` only; nothing is emailed.
- **Panchang / tithi.** Events use Gregorian dates. Hindu calendar dates would need a panchang library, and would be genuinely useful here.
- **Hindi UI.** Content supports Hindi; the interface labels are English. Adding `next-intl` would be a contained change.
- **Tests.** None. The validation schemas in `src/lib/validations.ts` are the obvious place to start.

# RadheShyamMandir
