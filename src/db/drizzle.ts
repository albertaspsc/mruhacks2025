import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
config({ path: ".env" }); // or .env.local
// const adminClient = postgres(
//   process.env.ADMIN_DATABASE_URL ?? process.env.DATABASE_URL!
// );
// export const adminDb = drizzle({ client: adminClient });
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle({ client, schema });
