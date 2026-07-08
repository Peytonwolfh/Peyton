# PetSitter CRM

An installable **Progressive Web App** for pet sitters — every client, pet, and visit in your
pocket. Built with Next.js 14 (App Router, TypeScript) + Supabase (auth + Postgres with
Row-Level Security), styled mobile-first in the TidySheetStudioFinds brand
(sage `#5C7A5E` · charcoal `#2E3436` · cream `#F4ECD6`).

## What it does

- **Login / sign up** — email + password via Supabase Auth. All app routes are protected;
  signed-out users are redirected to `/login`.
- **Dashboard** — six live stat cards computed from your real data on every load:
  active clients, pets under care, visits this week, visits today, unpaid balance
  (sum of completed-but-unpaid visits), and revenue this month.
- **Clients** — list + add form. Each client stores the fields that make this a pet-sitter
  CRM and not a contact list: **door/gate code, alarm info, key location, emergency
  contact, vet clinic + phone**, shown in a prominent "Access & security / Keep private"
  panel on the client detail page.
- **Pets** — per client: species, breed, age, feeding, medications, walk routine, behavior
  notes, and a **CAUTION toggle**. A flagged pet shows a red warning banner on the client
  page so you never walk in unprepared.
- **Visits** — log a visit (client, date, service, rate, status, paid toggle). Today's
  visits are highlighted, completed-but-unpaid visits show in red, and every visit has a
  one-tap Paid/Mark-paid toggle.
- **Native-app feel** — bottom tab bar (Dashboard / Clients / Visits), bottom-sheet forms,
  standalone display mode, offline fallback via a service worker.

Data isolation: every table has RLS (`auth.uid() = user_id`), so each account only ever
sees its own clients, pets, and visits. That is also why the anon key below is safe to
commit — it is the public client key, not a secret.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.local` is already included (public keys only). If you ever need to recreate it,
copy `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://fkjlyeltiuayfmdyzwnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rEuGxEdEVCwf2Gz26gbBjQ_tU7syPNa
```

Never add the Supabase `service_role` / secret key to this repo.

## Deploy FREE to Vercel (3 steps)

1. Push this repo to GitHub, then go to [vercel.com](https://vercel.com) → **Add New →
   Project** → import the repo. Set the project **Root Directory** to `app/petsitter`
   (Vercel auto-detects Next.js).
2. In the "Environment Variables" step, add the 2 vars from `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Click **Deploy**. You get a free `https://….vercel.app` URL with HTTPS — which is
   required for PWA install.

## Install it on a phone (Add to Home Screen)

Once deployed (must be the HTTPS URL):

- **iPhone (Safari):** open the app URL → tap the Share button → **Add to Home Screen** →
  Add. It launches full-screen with the sage PetSitter icon.
- **Android (Chrome):** open the app URL → Chrome shows an **Install app** prompt (or menu
  ⋮ → **Add to Home screen / Install app**).

## Supabase settings the owner must check (one-time)

1. **Email confirmation** — Supabase projects have "Confirm email" ON by default, which
   means a brand-new sign-up must click an emailed link before they can log in. For a
   single-owner app the simplest setup is:
   [Supabase Dashboard](https://supabase.com/dashboard) → project `fkjlyeltiuayfmdyzwnk` →
   **Authentication → Sign In / Providers → Email → turn OFF "Confirm email"** → Save.
   The login screen handles both modes either way (it shows a "check your email" notice if
   confirmation is on), but turning it off gives instant sign-up → sign-in.
2. **Site URL / redirect URLs** (only if you keep email confirmation ON) —
   Authentication → URL Configuration → set Site URL to your deployed Vercel URL so
   confirmation links land on the app.

## Tech notes

- `@supabase/ssr` cookie-based sessions: middleware (`middleware.ts`) refreshes the session
  and guards routes on every request; server components and server actions run queries as
  the signed-in user so RLS applies everywhere.
- PWA: `public/manifest.json` (name, 192/512 + maskable icons, `display: standalone`,
  `start_url: /dashboard`, theme `#5C7A5E`) + hand-rolled `public/sw.js`
  (network-first navigations with offline fallback, stale-while-revalidate static assets;
  Supabase requests are never intercepted). Icons are generated from the shop logo via
  `scripts/make_icons.py` (Pillow).
- Screenshots of every screen (iPhone 390×844) live in `screenshots/`.
