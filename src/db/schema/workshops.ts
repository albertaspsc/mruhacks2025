import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  time,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { DEFAULTS } from "@/constants";

export const workshops = pgTable("workshops", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  location: varchar("location", { length: 255 }),
  maxCapacity: integer("max_capacity").default(0),
  isActive: boolean("is_active").default(DEFAULTS.WORKSHOP_IS_ACTIVE),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
