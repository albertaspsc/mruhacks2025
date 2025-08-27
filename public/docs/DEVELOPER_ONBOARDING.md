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
# Studio: http://127.0.0.1:54323
# API:    http://127.0.0.1:54321
# DB:     postgres://postgres:postgres@127.0.0.1:54322/postgres
```

This command will output the anon and service_role keys you will need in the next section.

### 3) Environment variables

Create `.env.local` at the project root using values from Supabase.

Required keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# Copy the anon and service_role keys printed by `supabase start`
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

- Drizzle CLI reads from `.env` (not `.env.local`). Create `.env` and duplicate the values from `.env.local`:

```bash
cp .env.local .env
```

### 4) Database migrations (Drizzle)

- Config: `drizzle.config.ts`
- Schema: `src/db/schema.ts`
- Migrations: `utils/migrations/`

Run the migrations at least once on a fresh setup to initialize the database:

```bash
npm run db:mig
```

Common commands:

```bash
npm run db:gen      # generate migrations from schema changes
npm run db:mig      # apply migrations to the database in DATABASE_URL
npm run db:studio   # open Drizzle Studio
```

Note: Ensure `.env` exists (see step 3) so Drizzle can read `DATABASE_URL`.

### 5) Run the app

```bash
npm run dev
# open http://localhost:3000
```

### Troubleshooting

- "Cannot connect to the Docker daemon": Start Docker Desktop and re-run `supabase start`.
- Ports already in use on 54321/54322/54323: Stop any conflicting services or run `supabase stop` before `supabase start`.
- Drizzle cannot find `DATABASE_URL`: Make sure you created `.env` (copy from `.env.local`).
