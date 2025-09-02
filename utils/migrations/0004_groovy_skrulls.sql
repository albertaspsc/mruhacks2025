ALTER TABLE "mktg_preferences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "mktg_preferences" CASCADE;--> statement-breakpoint
ALTER TABLE "resumes" DROP CONSTRAINT "resumes_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "parking_info" ADD COLUMN "license_plate" varchar(8) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing_emails" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" DROP COLUMN "licence_plate";