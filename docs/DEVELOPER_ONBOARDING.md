## Developer Onboarding

### Prerequisites

- Node.js 20+ and npm 10+
- Git
- Supabase CLI: `npm i -g supabase` (for local Postgres/Auth/Studio)
- Docker Desktop (required by Supabase CLI for local services)

### 1) Clone and install

```bash
git clone https://github.com/albertaspsc/mruhacks2025.git
cd mruhacks2025
npm install
```

### 2) Run local Supabase

Make sure Docker Desktop is running before starting Supabase.

Start local Supabase services (Postgres, Auth, Studio):

```bash
supabase start
```

This command will output the anon and service_role keys you will need in the next section.

### 3) Environment variables

Create `.env.local` at the project root using values from `supabase start`. See `.example.env.local` for a template.

- Drizzle config prefers `.env.local` and falls back to `.env`.

### 4) Initialize database (Drizzle)

Run migrations, then seed lookup data:

```bash
npm run db:mig
npm run db:seed
```

Common commands:

```bash
npm run db:gen      # generate migrations from schema changes
npm run db:mig      # apply migrations to the database in DATABASE_URL
npm run db:studio   # open Drizzle Studio
npm run db:seed     # run idempotent seeds for lookup tables
```

Notes:

- Ensure `.env.local` exists (see step 3) so Drizzle can read `DATABASE_URL`.
- Do not duplicate app table DDL in `supabase/migrations/`. Keep those for system objects only.
- If you need to inspect the database locally, `npm run db:studio` opens Drizzle Studio.

### 5) Run the app

```bash
npm run dev
# open http://localhost:3000
```

### Troubleshooting

- "Cannot connect to the Docker daemon": Start Docker Desktop and re-run `supabase start`.
- Ports already in use on 54321/54322/54323: Stop any conflicting services or run `supabase stop` before `supabase start`.
