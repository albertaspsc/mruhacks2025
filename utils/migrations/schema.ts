import {
  pgTable,
  index,
  foreignKey,
  pgPolicy,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  unique,
  check,
  date,
  time,
  pgView,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const adminRole = pgEnum("admin_role", [
  "admin",
  "super_admin",
  "volunteer",
]);
export const adminStatus = pgEnum("admin_status", [
  "active",
  "inactive",
  "suspended",
]);
export const parkingState = pgEnum("parking_state", ["Yes", "No", "Not sure"]);
export const status = pgEnum("status", ["confirmed", "pending", "waitlisted"]);
export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    fName: varchar("f_name", { length: 255 }).notNull(),
    lName: varchar("l_name", { length: 255 }).notNull(),
    gender: integer().notNull(),
    university: integer().notNull(),
    prevAttendance: boolean("prev_attendance").notNull(),
    major: integer().notNull(),
    parking: parkingState().notNull(),
    email: varchar({ length: 255 }).notNull(),
    yearOfStudy: yearOfStudy().notNull(),
    experience: integer().notNull(),
    accommodations: text().notNull(),
    marketing: integer().notNull(),
    timestamp: timestamp({ mode: "string" }),
    status: status().default("waitlisted").notNull(),
    checkedIn: boolean("checked_in").default(false),
    resumeUrl: text("resume_url"),
    resumeFilename: varchar("resume_filename", { length: 255 }),
    pendingEmail: text("pending_email"),
    emailChangeRequestedAt: timestamp("email_change_requested_at", {
      withTimezone: true,
      mode: "string",
    }),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_users_resume_url")
      .using("btree", table.resumeUrl.asc().nullsLast().op("text_ops"))
      .where(sql`(resume_url IS NOT NULL)`),
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_auth_user_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.experience],
      foreignColumns: [experienceTypes.id],
      name: "users_experience_experience_types_id_fk",
    }),
    foreignKey({
      columns: [table.gender],
      foreignColumns: [gender.id],
      name: "users_gender_gender_id_fk",
    }),
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.major],
      foreignColumns: [majors.id],
      name: "users_major_majors_id_fk",
    }),
    foreignKey({
      columns: [table.marketing],
      foreignColumns: [marketingTypes.id],
      name: "users_marketing_marketing_types_id_fk",
    }),
    foreignKey({
      columns: [table.university],
      foreignColumns: [universities.id],
      name: "users_university_universities_id_fk",
    }),
    pgPolicy("Users can delete their own registrations", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("users_insert_own", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("users_select_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    pgPolicy("users_update_own", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
  ],
);

export const admins = pgTable(
  "admins",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    isAdminOnly: boolean("is_admin_only").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    fName: varchar("f_name", { length: 100 }),
    lName: varchar("l_name", { length: 100 }),
    role: adminRole().default("admin").notNull(),
    status: adminStatus().default("active").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_admins_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    index("idx_admins_role").using(
      "btree",
      table.role.asc().nullsLast().op("enum_ops"),
    ),
    index("idx_admins_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "admins_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "admins_id_users_id_fk",
    }),
    pgPolicy("admin_delete", {
      as: "permissive",
      for: "delete",
      to: ["authenticated"],
      using: sql`(is_super_admin() AND (auth.uid() <> id))`,
    }),
    pgPolicy("admin_insert", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("admin_update", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("admin_view_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
  ],
);

export const dietaryRestrictions = pgTable(
  "dietary_restrictions",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
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
    pgPolicy("dietary_restrictions_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const experienceTypes = pgTable(
  "experience_types",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
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
    pgPolicy("experience_types_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const gender = pgTable(
  "gender",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "gender_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    gender: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("gender_gender_unique").on(table.gender),
    pgPolicy("gender_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const interests = pgTable(
  "interests",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "interests_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    interest: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("interests_interest_unique").on(table.interest),
    pgPolicy("interests_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const majors = pgTable(
  "majors",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "majors_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    major: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("majors_major_unique").on(table.major),
    pgPolicy("majors_insert_authenticated", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`true`,
    }),
    pgPolicy("majors_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const marketingTypes = pgTable(
  "marketing_types",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "marketing_types_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    marketing: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("marketing_types_marketing_unique").on(table.marketing),
    pgPolicy("marketing_types_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const mktgPreferences = pgTable(
  "mktg_preferences",
  {
    id: uuid().primaryKey().notNull(),
    sendEmails: boolean("send_emails").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "mktg_preferences_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "mktg_preferences_id_users_id_fk",
    }),
    pgPolicy("Admins can view all marketing preferences", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status))))`,
    }),
    pgPolicy("Users can delete own marketing preferences", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can insert own marketing preferences", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update own marketing preferences", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can view own marketing preferences", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const parkingInfo = pgTable(
  "parking_info",
  {
    id: uuid().primaryKey().notNull(),
    licensePlate: varchar("license_plate", { length: 8 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "parking_info_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "parking_info_id_users_id_fk",
    }),
    pgPolicy("Admins can update parking info", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status))))`,
    }),
    pgPolicy("Admins can view all parking info", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can delete own parking info", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can insert own parking info", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update own parking info", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can view own parking info", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const profile = pgTable(
  "profile",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    fName: varchar("f_name", { length: 255 }),
    lName: varchar("l_name", { length: 255 }),
    marketingEmails: boolean("marketing_emails").default(false),
    parking: varchar({ length: 10 }).default("Not sure"),
    licensePlate: varchar("license_plate", { length: 20 }),
    pendingEmail: text("pending_email"),
    emailChangeRequestedAt: timestamp("email_change_requested_at", {
      withTimezone: true,
      mode: "string",
    }),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "profile_auth_user_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "profile_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "profile_id_users_id_fk",
    }),
    pgPolicy("Users can delete their own profile", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("users_insert_own_profile", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("users_update_own_profile", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("users_view_own_profile", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    check(
      "profile_parking_check",
      sql`(parking)::text = ANY (ARRAY[('Yes'::character varying)::text, ('No'::character varying)::text, ('Not sure'::character varying)::text])`,
    ),
  ],
);

export const universities = pgTable(
  "universities",
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "universities_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    uni: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("universities_uni_unique").on(table.uni),
    pgPolicy("universities_insert_authenticated", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`true`,
    }),
    pgPolicy("universities_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const userDietRestrictions = pgTable(
  "user_diet_restrictions",
  {
    id: uuid().notNull(),
    restriction: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_diet_restrictions_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.restriction],
      foreignColumns: [dietaryRestrictions.id],
      name: "user_diet_restrictions_restriction_dietary_restrictions_id_fk",
    }),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_diet_restrictions_user_fkey",
    }).onDelete("cascade"),
    pgPolicy("user_restrictions_insert_own", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`(auth.uid() = id)`,
    }),
    pgPolicy("user_restrictions_select_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
  ],
);

export const userInterests = pgTable(
  "user_interests",
  {
    id: uuid().notNull(),
    interest: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_interests_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.interest],
      foreignColumns: [interests.id],
      name: "user_interests_interest_interests_id_fk",
    }),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_interests_user_fkey",
    }).onDelete("cascade"),
    pgPolicy("user_interests_insert_own", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`(auth.uid() = id)`,
    }),
    pgPolicy("user_interests_select_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
  ],
);

export const workshopRegistrations = pgTable(
  "workshop_registrations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    workshopId: uuid("workshop_id").notNull(),
    registeredAt: timestamp("registered_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    fName: varchar("f_name", { length: 255 }),
    lName: varchar("l_name", { length: 255 }),
    yearOfStudy: varchar({ length: 50 }),
    gender: varchar({ length: 50 }),
    major: varchar({ length: 255 }),
  },
  (table) => [
    index("idx_workshop_registrations_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_workshop_registrations_workshop").using(
      "btree",
      table.workshopId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "workshop_registrations_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "workshop_registrations_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.workshopId],
      foreignColumns: [workshops.id],
      name: "workshop_registrations_workshop_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.workshopId],
      foreignColumns: [workshops.id],
      name: "workshop_registrations_workshop_id_workshops_id_fk",
    }).onDelete("cascade"),
    unique("workshop_registrations_user_id_workshop_id_key").on(
      table.userId,
      table.workshopId,
    ),
    pgPolicy("Allow admin read access to registrations", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`true`,
    }),
    pgPolicy("Authenticated users can read registrations", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    pgPolicy("Users can register for workshops", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can unregister from workshops", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can view their own registrations", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const workshops = pgTable(
  "workshops",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    eventName: varchar("event_name", { length: 255 }).notNull(),
    date: date().notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    location: varchar({ length: 255 }),
    maxCapacity: integer("max_capacity").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_workshops_date").using(
      "btree",
      table.date.asc().nullsLast().op("date_ops"),
    ),
    index("idx_workshops_event_date").using(
      "btree",
      table.eventName.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("date_ops"),
    ),
    pgPolicy("Authenticated users can delete workshops", {
      as: "permissive",
      for: "delete",
      to: ["authenticated"],
      using: sql`true`,
    }),
    pgPolicy("Authenticated users can insert workshops", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("Authenticated users can update workshops", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("Only authenticated users can view workshops", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Workshops are viewable by everyone", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);
export const adminManagementView = pgView("admin_management_view", {
  id: uuid(),
  email: varchar({ length: 255 }),
  role: adminRole(),
  status: adminStatus(),
  firstName: varchar({ length: 100 }),
  lastName: varchar({ length: 100 }),
  isAdminOnly: boolean("is_admin_only"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  lastSignInAt: timestamp("last_sign_in_at", {
    withTimezone: true,
    mode: "string",
  }),
  emailConfirmedAt: timestamp("email_confirmed_at", {
    withTimezone: true,
    mode: "string",
  }),
}).as(
  sql`SELECT a.id, a.email, a.role, a.status, a.f_name AS "firstName", a.l_name AS "lastName", a.is_admin_only, a.created_at, a.updated_at, u.last_sign_in_at, u.email_confirmed_at FROM admins a JOIN auth.users u ON a.id = u.id ORDER BY a.created_at DESC`,
);
