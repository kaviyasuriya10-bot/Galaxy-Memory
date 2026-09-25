# Galaxy Memory — Vercel + Supabase

A polished, private memory-galaxy website built with vanilla HTML/CSS/JS, Vercel serverless functions, Supabase Postgres, and Supabase Storage.

## What is included

- ✦ Galaxy view — memories appear as interactive stars
- Timeline, albums, tags, search, and stats
- Account registration and login
- Password hashing with bcrypt
- Signed HttpOnly session cookies
- Private per-user memory access
- Photo uploads up to 8 MB
- Private Supabase Storage with signed image URLs
- Responsive mobile/desktop UI
- Vercel-ready API routes

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Create a **private** Storage bucket named `memory-images`.
4. Copy `.env.example` into your Vercel project environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` — use a long random secret (32+ characters)
   - `SUPABASE_BUCKET=memory-images`
5. Deploy:

```bash
npm install
npx vercel --prod
```

For local development:

```bash
npm install
npx vercel dev
```

## Important

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it in browser JavaScript.

The photo endpoint validates that the requested Storage path belongs to the authenticated user's ID before creating a temporary signed URL.
