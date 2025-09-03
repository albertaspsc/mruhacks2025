import {
  pgTable,
  uuid,
  integer,
  foreignKey,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { dietaryRestrictions } from "./dietaryRestrictions";

export const userDietRestrictions = pgTable(
  "user_diet_restrictions",
  {
    id: uuid().notNull(),
    restriction: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_diet_restrictions_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.restriction],
      foreignColumns: [dietaryRestrictions.id],
      name: "user_diet_restrictions_restriction_dietary_restrictions_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.id, table.restriction],
      name: "user_diet_restrictions_id_restriction_pk",
    }),
  ],
);
