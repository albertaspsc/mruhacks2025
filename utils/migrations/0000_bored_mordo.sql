-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."admin_role" AS ENUM('admin', 'super_admin', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."admin_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."parking_state" AS ENUM('Yes', 'No', 'Not sure');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('confirmed', 'pending', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."year_of_study" AS ENUM('1st', '2nd', '3rd', '4th+', 'Recent Grad');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"f_name" varchar(255) NOT NULL,
	"l_name" varchar(255) NOT NULL,
	"gender" integer NOT NULL,
	"university" integer NOT NULL,
	"prev_attendance" boolean NOT NULL,
	"major" integer NOT NULL,
	"parking" "parking_state" NOT NULL,
	"email" varchar(255) NOT NULL,
	"yearOfStudy" "year_of_study" NOT NULL,
	"experience" integer NOT NULL,
	"accommodations" text NOT NULL,
	"marketing" integer NOT NULL,
	"timestamp" timestamp,
	"status" "status" DEFAULT 'waitlisted' NOT NULL,
	"checked_in" boolean DEFAULT false,
	"resume_url" text,
	"resume_filename" varchar(255),
	"pending_email" text,
	"email_change_requested_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_admin_only" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"f_name" varchar(100),
	"l_name" varchar(100),
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"status" "admin_status" DEFAULT 'active' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "dietary_restrictions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dietary_restrictions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restriction" varchar(255) NOT NULL,
	CONSTRAINT "dietary_restrictions_restriction_unique" UNIQUE("restriction")
);
--> statement-breakpoint
ALTER TABLE "dietary_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experience_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "experience_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"experience" varchar(255) NOT NULL,
	CONSTRAINT "experience_types_experience_unique" UNIQUE("experience")
);
--> statement-breakpoint
ALTER TABLE "experience_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gender" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gender_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"gender" varchar(255) NOT NULL,
	CONSTRAINT "gender_gender_unique" UNIQUE("gender")
);
--> statement-breakpoint
ALTER TABLE "gender" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "interests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"interest" varchar(255) NOT NULL,
	CONSTRAINT "interests_interest_unique" UNIQUE("interest")
);
--> statement-breakpoint
ALTER TABLE "interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "majors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "majors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"major" varchar(255) NOT NULL,
	CONSTRAINT "majors_major_unique" UNIQUE("major")
);
--> statement-breakpoint
ALTER TABLE "majors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "marketing_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "marketing_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"marketing" varchar(255) NOT NULL,
	CONSTRAINT "marketing_types_marketing_unique" UNIQUE("marketing")
);
--> statement-breakpoint
ALTER TABLE "marketing_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mktg_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"send_emails" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mktg_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "parking_info" (
	"id" uuid PRIMARY KEY NOT NULL,
	"license_plate" varchar(8) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parking_info" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"f_name" varchar(255),
	"l_name" varchar(255),
	"marketing_emails" boolean DEFAULT false,
	"parking" varchar(10) DEFAULT 'Not sure',
	"license_plate" varchar(20),
	"pending_email" text,
	"email_change_requested_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profile_parking_check" CHECK ((parking)::text = ANY (ARRAY[('Yes'::character varying)::text, ('No'::character varying)::text, ('Not sure'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "universities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "universities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uni" varchar(255) NOT NULL,
	CONSTRAINT "universities_uni_unique" UNIQUE("uni")
);
--> statement-breakpoint
ALTER TABLE "universities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_diet_restrictions" (
	"id" uuid NOT NULL,
	"restriction" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" uuid NOT NULL,
	"interest" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workshop_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workshop_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now(),
	"f_name" varchar(255),
	"l_name" varchar(255),
	"yearOfStudy" varchar(50),
	"gender" varchar(50),
	"major" varchar(255),
	CONSTRAINT "workshop_registrations_user_id_workshop_id_key" UNIQUE("user_id","workshop_id")
);
--> statement-breakpoint
ALTER TABLE "workshop_registrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"location" varchar(255),
	"max_capacity" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "workshops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_experience_experience_types_id_fk" FOREIGN KEY ("experience") REFERENCES "public"."experience_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_major_majors_id_fk" FOREIGN KEY ("major") REFERENCES "public"."majors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_marketing_marketing_types_id_fk" FOREIGN KEY ("marketing") REFERENCES "public"."marketing_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mktg_preferences" ADD CONSTRAINT "mktg_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mktg_preferences" ADD CONSTRAINT "mktg_preferences_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_auth_user_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_restriction_dietary_restrictions_id_fk" FOREIGN KEY ("restriction") REFERENCES "public"."dietary_restrictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_user_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_interests_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."interests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_resume_url" ON "users" USING btree ("resume_url" text_ops) WHERE (resume_url IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_admins_email" ON "admins" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_admins_role" ON "admins" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_admins_status" ON "admins" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_workshop_registrations_user" ON "workshop_registrations" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_workshop_registrations_workshop" ON "workshop_registrations" USING btree ("workshop_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_workshops_date" ON "workshops" USING btree ("date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_workshops_event_date" ON "workshops" USING btree ("event_name" date_ops,"date" date_ops);--> statement-breakpoint
CREATE VIEW "public"."admin_management_view" AS (SELECT a.id, a.email, a.role, a.status, a.f_name AS "firstName", a.l_name AS "lastName", a.is_admin_only, a.created_at, a.updated_at, u.last_sign_in_at, u.email_confirmed_at FROM admins a JOIN auth.users u ON a.id = u.id ORDER BY a.created_at DESC);--> statement-breakpoint
CREATE POLICY "Users can delete their own registrations" ON "users" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "users_insert_own" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_update_own" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "admin_delete" ON "admins" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((is_super_admin() AND (auth.uid() <> id)));--> statement-breakpoint
CREATE POLICY "admin_insert" ON "admins" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "admin_update" ON "admins" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "admin_view_own" ON "admins" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "dietary_restrictions_select_all" ON "dietary_restrictions" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "experience_types_select_all" ON "experience_types" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "gender_select_all" ON "gender" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "interests_select_all" ON "interests" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "majors_insert_authenticated" ON "majors" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "majors_select_all" ON "majors" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "marketing_types_select_all" ON "marketing_types" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Admins can view all marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status)))));--> statement-breakpoint
CREATE POLICY "Users can delete own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can insert own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can update parking info" ON "parking_info" AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status)))));--> statement-breakpoint
CREATE POLICY "Admins can view all parking info" ON "parking_info" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete own parking info" ON "parking_info" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can insert own parking info" ON "parking_info" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update own parking info" ON "parking_info" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own parking info" ON "parking_info" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own profile" ON "profile" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "users_insert_own_profile" ON "profile" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_update_own_profile" ON "profile" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_view_own_profile" ON "profile" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "universities_insert_authenticated" ON "universities" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "universities_select_all" ON "universities" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "user_restrictions_insert_own" ON "user_diet_restrictions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "user_restrictions_select_own" ON "user_diet_restrictions" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_interests_insert_own" ON "user_interests" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "user_interests_select_own" ON "user_interests" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Allow admin read access to registrations" ON "workshop_registrations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can read registrations" ON "workshop_registrations" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can register for workshops" ON "workshop_registrations" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can unregister from workshops" ON "workshop_registrations" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own registrations" ON "workshop_registrations" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Authenticated users can delete workshops" ON "workshops" AS PERMISSIVE FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can insert workshops" ON "workshops" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Authenticated users can update workshops" ON "workshops" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Only authenticated users can view workshops" ON "workshops" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Workshops are viewable by everyone" ON "workshops" AS PERMISSIVE FOR SELECT TO public;
*/