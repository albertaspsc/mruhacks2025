import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const gender = pgTable(
  "gender",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "gender_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    gender: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("gender_gender_unique").on(table.gender)],
);
