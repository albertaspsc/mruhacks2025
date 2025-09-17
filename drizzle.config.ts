import { config } from "dotenv";
import { existsSync } from "fs";
import { defineConfig } from "drizzle-kit";
const envFile = existsSync(".env.local") ? ".env.local" : ".env";
config({ path: envFile });
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./utils/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
  entities: {
    roles: {
      provider: "supabase",
    },
  },
  casing: "snake_case",
});
