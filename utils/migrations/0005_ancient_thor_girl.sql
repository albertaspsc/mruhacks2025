CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
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
	"marketing_emails" boolean NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"status" "status" DEFAULT 'waitlisted' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "admins" DROP CONSTRAINT "admins_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "parking_info" DROP CONSTRAINT "parking_info_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "resumes" DROP CONSTRAINT "resumes_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" DROP CONSTRAINT "user_diet_restrictions_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_major_majors_id_fk" FOREIGN KEY ("major") REFERENCES "public"."majors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_experience_experience_types_id_fk" FOREIGN KEY ("experience") REFERENCES "public"."experience_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_marketing_marketing_types_id_fk" FOREIGN KEY ("marketing") REFERENCES "public"."marketing_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_user_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_user_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_id_user_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_id_user_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_id_user_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;