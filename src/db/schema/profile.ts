import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const profile = pgTable("profile", {
  id: uuid().primaryKey().notNull(),
  email: varchar({ length: 255 }).notNull(),
  fName: varchar("f_name", { length: 255 }),
  lName: varchar("l_name", { length: 255 }),
});
