import { pgTable, uuid, varchar, foreignKey } from "drizzle-orm/pg-core";
import { adminRole, adminStatus } from "./enums";
import { users } from "./users";

export const admins = pgTable(
  "admins",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    role: adminRole().default("volunteer").notNull(),
    status: adminStatus().default("inactive").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "admins_id_users_id_fk",
    }),
  ],
);
