import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const universities = pgTable(
  "universities",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "universities_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    uni: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("universities_uni_unique").on(table.uni)],
);
