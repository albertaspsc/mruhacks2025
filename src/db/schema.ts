import {
  integer,
  pgTable,
  text,
  varchar,
  uuid,
  boolean,
  pgEnum,
  timestamp,
  customType,
  primaryKey,
  date,
  time,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";

// const rlsClient = pgRole("rls_client").existing();

export const dietaryRestrictions = pgTable("dietary_restrictions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  restriction: varchar({ length: 255 }).notNull().unique(),
});

export const userRestrictions = pgTable(
  "user_diet_restrictions",
  {
    user: uuid("id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    restriction: integer()
      .references(() => dietaryRestrictions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user, table.restriction] }),
  }),
);

export const interests = pgTable("interests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  interest: varchar({ length: 255 }).notNull().unique(),
});

export const userInterests = pgTable(
  "user_interests",
  {
    user: uuid("id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    interest: integer()
      .references(() => interests.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user, table.interest] }),
  }),
);

export const profiles = pgTable("profile", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  email: varchar({ length: 255 }).notNull(),
  firstName: varchar("f_name", { length: 255 }),
  lastName: varchar("l_name", { length: 255 }),
  marketingEmails: boolean("marketing_emails").default(false),
  parking: varchar({ length: 10 }).default("Not sure"),
  licensePlate: varchar("license_plate", { length: 20 }),
  pendingEmail: text("pending_email"),
  emailChangeRequestedAt: timestamp("email_change_requested_at", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);

// No  RLS
export const universities = pgTable("universities", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  university: varchar("uni", { length: 255 }).unique().notNull(),
});

// No  RLS
export const majors = pgTable("majors", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  major: varchar({ length: 255 }).unique().notNull(),
});

export const marketingTypes = pgTable("marketing_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  marketing: varchar({ length: 255 }).unique().notNull(),
});

export const experienceTypes = pgTable("experience_types", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  experience: varchar({ length: 255 }).unique().notNull(),
});

export const gender = pgTable("gender", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  gender: varchar({ length: 255 }).unique().notNull(),
});

export const parkingSituation = pgEnum("parking_state", [
  "Yes",
  "No",
  "Not sure",
]);

export const status = pgEnum("status", ["confirmed", "pending", "waitlisted"]);

const bytea = customType<{
  data: Buffer;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id)
    .notNull(),
  email: varchar({ length: 255 }).notNull(),
  firstName: varchar("f_name", { length: 255 }).notNull(),
  lastName: varchar("l_name", { length: 255 }).notNull(),
  gender: integer()
    .references(() => gender.id)
    .notNull(),
  university: integer()
    .references(() => universities.id)
    .notNull(),
  previousAttendance: boolean("prev_attendance").notNull(),
  major: integer()
    .references(() => majors.id)
    .notNull(),
  parking: parkingSituation().notNull(),
  yearOfStudy: yearOfStudy().notNull(),
  experience: integer()
    .references(() => experienceTypes.id)
    .notNull(),
  accommodations: text().notNull(),
  marketing: integer()
    .references(() => marketingTypes.id)
    .notNull(),
  timestamp: timestamp().defaultNow().notNull(),
  status: status().default("pending").notNull(),
  resumeUrl: text("resume_url"),
  resumeFilename: varchar("resume_filename", { length: 255 }),
  checkedIn: boolean("checked_in").default(false).notNull(),
  pendingEmail: text("pending_email"),
  emailChangeRequestedAt: timestamp("email_change_requested_at", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Admin specific enums
export const adminRole = pgEnum("admin_role", [
  "volunteer",
  "admin",
  "super_admin",
]);

export const adminStatus = pgEnum("admin_status", [
  "active",
  "inactive",
  "suspended",
]);

export const admins = pgTable(
  "admins",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id)
      .notNull(),
    email: varchar({ length: 255 }).notNull(),
    isAdminOnly: boolean("is_admin_only").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    fName: varchar("f_name", { length: 100 }),
    lName: varchar("l_name", { length: 100 }),
    role: adminRole().default("admin").notNull(),
    status: adminStatus().default("active").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxAdminsEmail: index("idx_admins_email").on(table.email),
    idxAdminsRole: index("idx_admins_role").on(table.role),
    idxAdminsStatus: index("idx_admins_status").on(table.status),
  }),
);

export const marketingPreferences = pgTable("mktg_preferences", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  sendEmails: boolean("send_emails").default(true).notNull(),
});

export const parkingInfo = pgTable("parking_info", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  licensePlate: varchar("license_plate", { length: 8 }).notNull(),
});

// Workshops
export const workshops = pgTable(
  "workshops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    description: text("description"),
    eventName: varchar("event_name", { length: 255 }).notNull(),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    location: varchar({ length: 255 }),
    maxCapacity: integer("max_capacity").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    idxWorkshopsDate: index("idx_workshops_date").on(table.date),
    idxWorkshopsEventDate: index("idx_workshops_event_date").on(
      table.eventName,
      table.date,
    ),
  }),
);

export const workshopRegistrations = pgTable(
  "workshop_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => authUsers.id, { onDelete: "cascade" })
      .notNull(),
    workshopId: uuid("workshop_id")
      .references(() => workshops.id, { onDelete: "cascade" })
      .notNull(),
    registeredAt: timestamp("registered_at", {
      withTimezone: true,
    }).defaultNow(),
    fName: varchar("f_name", { length: 255 }),
    lName: varchar("l_name", { length: 255 }),
    yearOfStudy: varchar("yearOfStudy", { length: 50 }),
    gender: varchar({ length: 50 }),
    major: varchar({ length: 255 }),
  },
  (table) => ({
    uqUserWorkshop: uniqueIndex(
      "workshop_registrations_user_id_workshop_id_key",
    ).on(table.userId, table.workshopId),
    idxRegUser: index("idx_workshop_registrations_user").on(table.userId),
    idxRegWorkshop: index("idx_workshop_registrations_workshop").on(
      table.workshopId,
    ),
  }),
);
