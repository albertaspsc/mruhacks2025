import { pgTable, integer, varchar, unique } from "drizzle-orm/pg-core";

export const experienceTypes = pgTable(
  "experience_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "experience_types_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    experience: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("experience_types_experience_unique").on(table.experience),
  ],
);
