import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { workshops } from "./workshops";

export const workshopRegistrations = pgTable("workshop_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  workshopId: uuid("workshop_id")
    .references(() => workshops.id, { onDelete: "cascade" })
    .notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  fName: varchar("f_name", { length: 255 }),
  lName: varchar("l_name", { length: 255 }),
  yearOfStudy: varchar("yearOfStudy", { length: 50 }),
  gender: varchar("gender", { length: 50 }),
  major: varchar("major", { length: 255 }),
});
