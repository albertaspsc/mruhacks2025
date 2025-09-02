CREATE TYPE "public"."parking_state" AS ENUM('Yes', 'No', 'Not sure');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('confirmed', 'pending', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."year_of_study" AS ENUM('1st', '2nd', '3rd', '4th+', 'Recent Grad');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" "status" DEFAULT 'waitlisted' NOT NULL
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
CREATE TABLE "user_interests" (
	"id" uuid NOT NULL,
	"interest" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_diet_restrictions" (
	"id" uuid NOT NULL,
	"restriction" integer NOT NULL
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
	"school_email" varchar(255) NOT NULL,
	"yearOfStudy" "year_of_study" NOT NULL,
	"experience" integer NOT NULL,
	"accommodations" text NOT NULL,
	"marketing" integer NOT NULL,
	"timestamp" timestamp,
	"status" "status" DEFAULT 'waitlisted'
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_profile_id_fk" FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_id_profile_id_fk" FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_interests_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."interests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_id_profile_id_fk" FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_restriction_dietary_restrictions_id_fk" FOREIGN KEY ("restriction") REFERENCES "public"."dietary_restrictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_profile_id_fk" FOREIGN KEY ("id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_major_majors_id_fk" FOREIGN KEY ("major") REFERENCES "public"."majors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_experience_experience_types_id_fk" FOREIGN KEY ("experience") REFERENCES "public"."experience_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_marketing_marketing_types_id_fk" FOREIGN KEY ("marketing") REFERENCES "public"."marketing_types"("id") ON DELETE no action ON UPDATE no action;

CREATE OR REPLACE FUNCTION public.copy_user_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile (id, email, f_name, l_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 2))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_copy_user_to_profiles
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.copy_user_to_profiles();

CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
new.timestamp := CURRENT_TIMESTAMP;
RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_users_timestamp
BEFORE INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE update_users_timestamp();

