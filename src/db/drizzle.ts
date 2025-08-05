import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Only load .env in development
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure postgres client for Vercel serverless environment
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1, // Limit connections for serverless
  idle_timeout: 20, // Close idle connections quickly
  connect_timeout: 60,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const db = drizzle({ client, schema });
