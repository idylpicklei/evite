# Wedding Evite

A wedding invitation and RSVP site built with Astro, deployed on Cloudflare Pages. Guests scroll to open a virtual envelope, view the invitation, and log in with a unique invite code to RSVP and share a mailing address for a physical invitation.

## Features

- Scroll-driven envelope animation revealing the invitation
- Azalea-themed background with customizable color palette
- Wedding typography (Great Vibes, Cormorant)
- Countdown to the wedding date (default: May 15, 2026)
- Per-guest invite code login
- RSVP form with dietary notes and messages
- Mailing address collection for physical invitations
- CSV export of responses

## Quick start

### Prerequisites

- Node.js 22+
- A [Cloudflare](https://cloudflare.com) account

### Install and run locally

```bash
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars and set SESSION_SECRET to a long random string

npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

Test login with a seeded guest from [`data/guests.example.csv`](data/guests.example.csv), e.g. **Jane Smith** / **ROSE2026**.

## Customizing the wedding

Edit [`config/wedding.json`](config/wedding.json):

- `weddingDate` — ISO date/time for the countdown and invitation
- `couple` — partner names
- `venue` — location details
- `theme` — color palette (primary, secondary, accent, background, text, envelope colors)

Redeploy after changes for them to take effect in production.

## Guest list

1. Copy [`data/guests.example.csv`](data/guests.example.csv) to your own CSV with columns: `full_name`, `invite_code`, `email`
2. Run locally: `npm run db:seed -- path/to/guests.csv`
3. Run on production D1: `npm run db:seed:remote -- path/to/guests.csv`

Each guest receives a unique invite code. Share links like:

```
https://your-site.pages.dev/rsvp?code=ROSE2026
```

## Cloudflare deployment

### 1. Create the D1 database

```bash
npx wrangler d1 create evite-db
```

Copy the returned `database_id` into [`wrangler.jsonc`](wrangler.jsonc) under `d1_databases`.

### 2. Run migrations on production

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

### 3. Set secrets

In the Cloudflare dashboard (Pages → your project → Settings → Environment variables) or via CLI:

```bash
npx wrangler pages secret put SESSION_SECRET
npx wrangler pages secret put ADMIN_EXPORT_SECRET   # optional, for CSV export API
```

Also add a **D1 database binding** in the Pages project settings:

- **Variable name:** `DB`
- **D1 database:** `evite-db`

### 4. Deploy via GitHub

Connect the repo to Cloudflare Pages:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 22

Or deploy manually:

```bash
npm run deploy
```

Do not use `npx wrangler deploy` for this project unless you intentionally want a standalone Worker deployment. This site is configured for Cloudflare Pages, so manual deploys should use `wrangler pages deploy`.

## Viewing RSVPs

### SQL query (local)

```bash
npm run export:rsvp
```

Or use the query in [`scripts/export-rsvps.sql`](scripts/export-rsvps.sql):

```bash
npx wrangler d1 execute evite-db --remote --file=scripts/export-rsvps.sql
```

### CSV export API (optional)

If `ADMIN_EXPORT_SECRET` is set:

```bash
curl -H "Authorization: Bearer YOUR_SECRET" https://your-site.pages.dev/api/admin/export -o rsvps.csv
```

## Project structure

```
config/wedding.json     Wedding details and theme colors
data/guests.example.csv Example guest list for seeding
migrations/             D1 database schema
src/components/         UI components (envelope, forms, countdown)
src/pages/api/          Auth, RSVP, address, and export endpoints
src/lib/                Config, database, and auth helpers
```

## Tech stack

- [Astro 7](https://astro.build) with React islands
- [Cloudflare Pages](https://pages.cloudflare.com) + Workers + D1
- [GSAP ScrollTrigger](https://gsap.com) for envelope animation
- [jose](https://github.com/panva/jose) for session tokens
