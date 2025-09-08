CREATE TYPE "public"."admin_role" AS ENUM('volunteer', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."admin_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."parking_state" AS ENUM('Yes', 'No', 'Not sure');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('confirmed', 'pending', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."year_of_study" AS ENUM('1st', '2nd', '3rd', '4th+', 'Recent Grad');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "admin_role" DEFAULT 'volunteer' NOT NULL,
	"status" "admin_status" DEFAULT 'inactive' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dietary_restrictions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dietary_restrictions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restriction" varchar(255) NOT NULL,
	CONSTRAINT "dietary_restrictions_restriction_unique" UNIQUE("restriction")
);
--> statement-breakpoint
CREATE TABLE "experience_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "experience_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"experience" varchar(255) NOT NULL,
	CONSTRAINT "experience_types_experience_unique" UNIQUE("experience")
);
--> statement-breakpoint
CREATE TABLE "gender" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gender_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"gender" varchar(255) NOT NULL,
	CONSTRAINT "gender_gender_unique" UNIQUE("gender")
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"interest" varchar(255) NOT NULL,
	CONSTRAINT "interests_interest_unique" UNIQUE("interest")
);
--> statement-breakpoint
CREATE TABLE "majors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "majors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"major" varchar(255) NOT NULL,
	CONSTRAINT "majors_major_unique" UNIQUE("major")
);
--> statement-breakpoint
CREATE TABLE "marketing_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "marketing_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"marketing" varchar(255) NOT NULL,
	CONSTRAINT "marketing_types_marketing_unique" UNIQUE("marketing")
);
--> statement-breakpoint
CREATE TABLE "mktg_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"send_emails" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parking_info" (
	"id" uuid PRIMARY KEY NOT NULL,
	"license_plate" varchar(8) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"f_name" varchar(255),
	"l_name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "universities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uni" varchar(255) NOT NULL,
	CONSTRAINT "universities_uni_unique" UNIQUE("uni")
);
--> statement-breakpoint
CREATE TABLE "user_diet_restrictions" (
	"id" uuid NOT NULL,
	"restriction" integer NOT NULL,
	CONSTRAINT "user_diet_restrictions_id_restriction_pk" PRIMARY KEY("id","restriction")
);
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" uuid NOT NULL,
	"interest" integer NOT NULL,
	CONSTRAINT "user_interests_id_interest_pk" PRIMARY KEY("id","interest")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"f_name" varchar(255) NOT NULL,
	"l_name" varchar(255) NOT NULL,
	"gender" integer NOT NULL,
	"university" integer NOT NULL,
	"prev_attendance" boolean NOT NULL,
	"major" integer NOT NULL,
	"parking" "parking_state" NOT NULL,
	"year_of_study" "year_of_study" NOT NULL,
	"experience" integer NOT NULL,
	"accommodations" text NOT NULL,
	"marketing" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"resume_url" varchar(500),
	"resume_filename" varchar(255),
	"checked_in" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mktg_preferences" ADD CONSTRAINT "mktg_preferences_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_restriction_dietary_restrictions_id_fk" FOREIGN KEY ("restriction") REFERENCES "public"."dietary_restrictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_interests_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_major_majors_id_fk" FOREIGN KEY ("major") REFERENCES "public"."majors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_experience_experience_types_id_fk" FOREIGN KEY ("experience") REFERENCES "public"."experience_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_marketing_marketing_types_id_fk" FOREIGN KEY ("marketing") REFERENCES "public"."marketing_types"("id") ON DELETE no action ON UPDATE no action;