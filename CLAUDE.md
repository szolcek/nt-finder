# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Apply schema changes to database
npm run db:generate  # Generate Drizzle migrations
npm run db:studio    # Visual database editor
npm run db:seed      # Seed 223 locations from JSON (npx tsx src/lib/db/seed.ts)
```

Start the dev server before opening in browser.

## Architecture

**TrustQuest** - a Next.js 16 app for discovering, tracking, and reviewing National Trust properties. Uses App Router with React Server Components.

### Stack
- **Framework**: Next.js 16.2.1 / React 19 / TypeScript
- **Database**: Neon serverless PostgreSQL via Drizzle ORM
- **Auth**: NextAuth.js v5 (beta) with Google & Apple OAuth, JWT sessions
- **Maps**: Google Maps API (@vis.gl/react-google-maps) with marker clustering
- **Storage**: AWS S3 with presigned uploads, CloudFront CDN
- **UI**: Tailwind CSS v4, shadcn (base-nova style), Lucide icons
- **Validation**: Zod (integrated with Drizzle via drizzle-zod)

### Key directories
- `src/app/` - Pages: homepage, `/locations` (map view), `/locations/[slug]` (detail), `/trips`, `/account`, `/sign-in`
- `src/actions/` - Server actions for visits, trips, reviews, photos, account (all use Zod validation + auth checks)
- `src/components/` - Domain components + `ui/` for shadcn primitives
- `src/lib/db/schema.ts` - All Drizzle table definitions (locations, pricing, reviews, trips, photos, visits, auth tables)
- `src/lib/db/locations-full-data.json` - Seed data for 223 NT properties with pricing
- `drizzle/` - SQL migration files

### Data flow patterns
- **Server actions pattern**: Client component -> Zod validation -> DB mutation -> `revalidatePath()`
- **Visit tracking**: Dual persistence - localStorage (offline/unauth) + `userVisits` table (auth). Syncs on login via `syncLocalStorageVisits()`
- **Map state**: Camera position, filters, search, and selection all persisted in URL search params
- **Location pages**: Statically generated at build time (`generateStaticParams`), revalidated every 3600s
- **Photo uploads**: Client -> `/api/upload` (presigned S3 URL) -> S3 direct upload -> `confirmPhotoUpload()` server action

### Database schema highlights
- `locationPricing` has flexible categories (standard, house-and-garden, garden-only, etc.) with date ranges for seasonal pricing
- `reviews` enforces one review per user per location
- `userVisits` allows multiple visit records per user per location (visit history)
- Auth tables managed by Drizzle adapter for NextAuth

### Environment variables
Auth: `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_APPLE_ID/SECRET`
Database: `DATABASE_URL`
S3: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `CLOUDFRONT_DOMAIN`
Maps: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`
