![MRU Hacks](public/color-logo.svg)

## MRU Hacks 2025

This repo is home to the MRUHacks 2025 website.

### Quick start

1. Install dependencies: `npm install`
2. Create `.env.local` (see `docs/ENV_SETUP.md`)
3. Run dev server: `npm run dev` → http://localhost:3000

### Scripts

```bash
# App
npm run dev      # start dev server
npm run build    # build
npm run start    # start production build
npm run lint     # lint

# Database (Drizzle)
npm run db:gen   # generate migrations
npm run db:mig   # run migrations
npm run db:studio# open Drizzle Studio
```

### Tech

- **Next.js 15**, **React 19**, **TypeScript**
- **Supabase** (auth + DB), **Drizzle ORM**
- **Tailwind** + shadcn/ui

### Database

- Migrations live in `utils/migrations/`
- Supabase and Drizzle config in `supabase/` and `src/db/`

### Docs

- Developer Onboarding: `docs/DEVELOPER_ONBOARDING.md`
- Environment setup: `docs/ENV_SETUP.md`
- Auth flows: `docs/AUTH_FLOWS.md`
- API contract: `docs/API_CONTRACT.md`
