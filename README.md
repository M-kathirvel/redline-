# Redline Marketing

Next.js App Router site for Redline Marketing with a public portfolio, contact flows, and a cookie-protected admin dashboard.

## Run locally

1. Install Node.js 18.18+ (Node.js 20+ recommended) and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Configure the Supabase project values and a long random `SESSION_SECRET` (at least 32 characters).
4. Apply [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor. Reapply it to an existing project to add the optional `video_url` field.
5. Run `npm run dev`, then open `http://localhost:3000`.

The admin username defaults to `redline`. The example bcrypt hash is for the requested initial password `redline@123`; replace it with a new hash before deploying. Generate one with:

```bash
node -e "require('bcryptjs').hash('your-new-password', 12).then(console.log)"
```

Set that output as `ADMIN_PASSWORD_HASH`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to a browser or commit `.env.local`.

## Supabase and access control

- The SQL creates `projects`, `site_stats`, a seeded counter row, public-read RLS policies, and the public `portfolio-media` bucket.
- The browser-facing site only uses the anon key for public reads.
- Admin APIs verify the signed, HTTP-only `redline_admin_session` cookie before using the server-only service role for project, counter, and storage writes.
- No authenticated/anonymous client write policies are created. Do not add broad write policies to these tables or the bucket.
- Uploaded portfolio images are limited to JPG, PNG, WebP, or AVIF and 12 MB.

## Business contact note

Aravind's 10-digit contact number is stored as `7708448375`, displayed as `+91 7708448375`, and prefixed with `91` when generating the WhatsApp link.

## Production

Set all environment values in the hosting provider, run `npm run build`, and deploy with `npm start` or the provider's Next.js runtime. Replace the sample credential hash and rotate the session secret before production.
