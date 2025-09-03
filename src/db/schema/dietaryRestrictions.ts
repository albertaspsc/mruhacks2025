import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const dietaryRestrictions = pgTable(
  "dietary_restrictions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "dietary_restrictions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    restriction: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("dietary_restrictions_restriction_unique").on(table.restriction),
  ],
);
