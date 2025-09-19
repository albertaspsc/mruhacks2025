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

This command also runs migrations and seeds the lookup tables.

### 3) Environment variables

Create `.env.local` at the project root using values from `supabase start`. See `.example.env.local` for a template.

- Drizzle config prefers `.env.local` and falls back to `.env`.

### 4) Run the app

```bash
npm run dev
# open http://localhost:3000
```

### 5) Testing

```bash
# Run all tests
npm run test

# Run only unit tests
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### Troubleshooting

- "Cannot connect to the Docker daemon": Start Docker Desktop and re-run `supabase start`.
- Ports already in use on 54321/54322/54323: Stop any conflicting services or run `supabase stop` before `supabase start`.
