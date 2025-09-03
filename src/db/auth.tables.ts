import { pgSchema, uuid } from "drizzle-orm/pg-core";

export const auth = pgSchema("auth");

export const authUsers = auth.table("users", {
  id: uuid("id").primaryKey().notNull(),
});
