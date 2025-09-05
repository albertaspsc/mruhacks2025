## Database module (Drizzle + Supabase)

This folder contains the application database layer built with Drizzle ORM (PostgreSQL) and Supabase. The schema is split into focused modules and re-exported via a barrel for ergonomic imports.

### Layout

- `drizzle.ts`: Creates and exports the Drizzle `db` client configured for PostgreSQL (SSL in production). It imports the full schema to enable type-safe queries.
- `admin.ts`: Server actions and helpers for admin-related logic (e.g., `isAdmin`, `grantAdmin`, listing users with joins).
- `relations.ts`: Relationship mappings between tables using `relations(...)` from Drizzle. Keep this in sync with schema changes.
- `auth.tables.ts`: Runtime-only mapping for `auth.users` (Supabase). Not part of Drizzle migrations.
- `schema/`: Modular schema definitions (one file per table/group) and a barrel `index.ts`.

### Schema modules (`schema/`)

- `index.ts`: Barrel that re-exports all schema modules. Also includes compatibility aliases:

  - `profiles` → `profile`
  - `parkingSituation` → `parkingEnum`
    Import from here everywhere: `import { users, universities } from "@/db/schema"`.

- `enums.ts`: All Postgres enums used in the schema:

  - `adminRole`, `adminStatus`, `parkingEnum`, `status`, `yearOfStudyEnum`

- Core tables (entities):

  - `profile.ts`: `profile` table (basic user profile mirror for public access).
  - `users.ts`: Main registration record with FKs to lookup tables and enums.
  - `admins.ts`: Admin assignments for users.

- User preferences and supplemental:

  - `mktgPreferences.ts`: Per-user marketing email preferences.
  - `parkingInfo.ts`: Per-user parking license plate.

- Lookup tables:

  - `gender.ts`: Gender options (unique on `gender`).
  - `universities.ts`: Institutions (unique on `uni`).
  - `majors.ts`: Majors (unique on `major`).
  - `experienceTypes.ts`: Experience levels (unique on `experience`).
  - `marketingTypes.ts`: Marketing source (unique on `marketing`).
  - `interests.ts`: Interest tags (unique on `interest`).
  - `dietaryRestrictions.ts`: Dietary restriction options (unique on `restriction`).

- Junction tables (many-to-many):
  - `userInterests.ts`: User ↔ Interest with composite PK `(id, interest)`.
  - `userDietRestrictions.ts`: User ↔ DietaryRestriction with composite PK `(id, restriction)`.

### How to use

- Import schema anywhere via the barrel:

```ts
import { db } from "@/db/drizzle";
import { users, universities } from "@/db/schema";
```

- Query with type safety using Drizzle:

```ts
const rows = await db.select().from(users).limit(10);
```

- Relations are defined in `relations.ts` for more complex graph queries.

### Migrations

- Drizzle Kit config lives at project root: `drizzle.config.ts`.
  - Schema entry points to `./src/db/schema/index.ts`.
  - Migrations output to `./utils/migrations`.
- Typical workflow:
  - Update/add schema modules in `src/db/schema/`.
  - Generate SQL: `npx drizzle-kit generate`
  - Apply to DB: `npx drizzle-kit migrate` (or your project’s script alias)

Notes:

- `auth.tables.ts` maps Supabase `auth.users` and is not managed by Drizzle migrations.
- Keep `relations.ts` updated when adding new tables/foreign keys.

### Adding a new table

1. Create `src/db/schema/<tableName>.ts` with `pgTable(...)` definition.
2. Export it from `src/db/schema/index.ts`.
3. If needed, add relations in `src/db/relations.ts`.
4. Generate and run migrations.

### Compatibility aliases

To avoid broad code changes while modularizing the schema, these aliases are exported from the barrel:

- `profiles` (alias for `profile`)
- `parkingSituation` (alias for `parkingEnum`)

If you create new aliases for backwards compatibility, document them here.
