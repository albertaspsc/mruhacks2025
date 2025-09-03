import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const marketingTypes = pgTable(
  "marketing_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "marketing_types_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    marketing: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("marketing_types_marketing_unique").on(table.marketing)],
);
