import {
  pgTable,
  uuid,
  integer,
  foreignKey,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { interests } from "./interests";

export const userInterests = pgTable(
  "user_interests",
  {
    id: uuid().notNull(),
    interest: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_interests_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.interest],
      foreignColumns: [interests.id],
      name: "user_interests_interest_interests_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.id, table.interest],
      name: "user_interests_id_interest_pk",
    }),
  ],
);
