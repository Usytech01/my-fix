# My_Fix — Lagos Home Services Marketplace

**My_Fix** connects homeowners in Lagos with verified local artisans. This repo includes a **Next.js** stakeholder portal, **Supabase** backend, and product docs.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Backend** | Supabase (PostgreSQL, PostGIS, Auth, Edge Functions) |
| **Payments** | Paystack webhook (`supabase/functions/paystack-webhook`) |

---

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # required by the seed API
```

To enable the one-click **Run Database Artisan Seed** button (Supabase tab),
also set a matching admin token pair — the `/api/seed` route is admin-gated
and refuses requests without it:

```bash
ADMIN_SEED_TOKEN=<any long random string>            # server-side check
NEXT_PUBLIC_ADMIN_SEED_TOKEN=<same value as above>   # sent from the browser
```

### 3. Run the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Apply database migrations

In the Supabase SQL Editor, run:

- `supabase/migrations/20260525000000_init.sql`
- `supabase/migrations/20260525000001_backend_fixes.sql`

Or seed artisans from the **Supabase** tab in the app (requires the
`SUPABASE_SERVICE_ROLE_KEY` and matching `*_ADMIN_SEED_TOKEN` env vars above).

---

## Project structure

```
my-fix/
├── app/                    # Next.js App Router (pages, API, styles)
├── components/             # React UI (discovery, onboarding, escrow)
├── context/                # Global app state (AppContext)
├── lib/                    # Types, constants, Supabase client, geo utils
├── doc/                    # PRD & analysis
├── legacy/                 # Previous static HTML/CSS/JS portal
├── supabase/
│   ├── migrations/
│   └── functions/
└── seed.js                 # CLI database seeder (Node + pg)
```

---

## Portal features

1. **Discovery** — PostGIS proximity search with live Supabase RPC + local fallback
2. **Onboarding** — NIN/BVN verification wizard with NIMC downtime simulation
3. **Escrow** — Paystack checkout mock, price exploit tester, state machine
4. **Supabase** — Connection status and one-click artisan seeding

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run seed` | Seed DB via `seed.js` (direct Postgres) |

---

## Product documentation

- Full PRD: [`doc/My_Fix_PRD_v1.md`](doc/My_Fix_PRD_v1.md)
- Strategic analysis: [`doc/prd_analysis.md`](doc/prd_analysis.md)

---

## Escrow state engine

```
[Pending Booking] → (Client Pays) → [Paid / Held in Escrow]
       ├─ (Confirm) → [Released to Artisan]
       └─ (Dispute) → [Escrow Frozen] → Admin resolution
```

See `supabase/functions/paystack-webhook/index.ts` for server-side payment validation.
