CREATE TABLE "mktg_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"send_emails" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parking_info" (
	"id" uuid PRIMARY KEY NOT NULL,
	"licence_plate" varchar(8) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"resume" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "yearOfStudy" TO "year_of_study";--> statement-breakpoint
ALTER TABLE "admins" DROP CONSTRAINT "admins_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" DROP CONSTRAINT "profile_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" DROP CONSTRAINT "user_diet_restrictions_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "mktg_preferences" ADD CONSTRAINT "mktg_preferences_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "school_email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "resume";
ALTER TABLE "resumes" DROP CONSTRAINT "resumes_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Trigger function to insert default marketing preferences
CREATE OR REPLACE FUNCTION insert_default_mktg_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO mktg_preferences (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to insert parking info only if parking = 'Yes'
CREATE OR REPLACE FUNCTION insert_parking_info_if_parking_yes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parking = 'Yes' THEN
    INSERT INTO parking_info (id, licence_plate)
    VALUES (NEW.id, 'ABC-123');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on users table
CREATE OR REPLACE TRIGGER trg_insert_mktg_preferences
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION insert_default_mktg_preferences();

CREATE OR REPLACE TRIGGER trg_insert_parking_info
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION insert_parking_info_if_parking_yes();
