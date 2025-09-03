import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const majors = pgTable(
  "majors",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "majors_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    major: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("majors_major_unique").on(table.major)],
);
