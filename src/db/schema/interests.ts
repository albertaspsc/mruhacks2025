import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const interests = pgTable(
  "interests",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "interests_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    interest: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("interests_interest_unique").on(table.interest)],
);
