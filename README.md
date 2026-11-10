# GeniusPorn — starter kit

A Next.js + Supabase + OpenAI Image API starter. This is source code, not a deployed site.

## 1. Requirements
- Node.js 20+
- Supabase project
- OpenAI API key with image-generation access

## 2. Install
```bash
npm install
cp .env.example .env.local
```
Fill `.env.local` with your Supabase project URL, publishable/anon key and OpenAI API key. Never expose the OpenAI key with a `NEXT_PUBLIC_` prefix.

## 3. Configure Supabase
1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. In Authentication > URL Configuration, set your Site URL to your Vercel domain (or `http://localhost:3000` locally).
4. Add redirect URL `http://localhost:3000/auth/callback` and your production URL ending in `/auth/callback`.
5. Configure email OTP / magic links in Supabase Auth.

The starter uses a private Storage bucket and short-lived signed URLs for each user's gallery. Storage policies restrict access to the owning user's folder.

## 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000.

## 5. Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel, import that repository.
3. Add all variables from `.env.example` in Project Settings > Environment Variables.
4. Deploy.
5. Add your production domain and `/auth/callback` to Supabase Auth redirect URLs.
6. Redeploy after changing environment variables.

## Important production work still required
- Add rate limiting / per-user quotas to `/api/generate`.
- Add moderation and abuse reporting; keep age-appropriate content restrictions.
- Add billing only after validating provider terms.
- Consider private Storage + signed URLs instead of a public bucket.
- Add deletion/export controls and retention policy.
- Add CAPTCHA / bot protection to email login.
- Review current OpenAI image API availability, organization verification, model access, and pricing in your account.

## Stack
- Next.js App Router
- Supabase Auth with cookie-based SSR (`@supabase/ssr`)
- Supabase Postgres + Storage
- OpenAI Images API (`gpt-image-2.5-flare`)
