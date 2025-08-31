ALTER TYPE "public"."admin_status" ADD VALUE 'suspended';--> statement-breakpoint
CREATE TABLE "workshop_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workshop_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now(),
	"f_name" varchar(255),
	"l_name" varchar(255),
	"yearOfStudy" varchar(50),
	"gender" varchar(50),
	"major" varchar(255)
);
--> statement-breakpoint
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
ALTER TABLE "admins" DROP CONSTRAINT "admins_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "resume_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "is_admin_only" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "f_name" varchar(100);--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "l_name" varchar(100);--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "marketing_emails" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "parking" varchar(10) DEFAULT 'Not sure';--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "license_plate" varchar(20);--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "pending_email" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "email_change_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_change_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workshop_registrations_user_id_workshop_id_key" ON "workshop_registrations" USING btree ("user_id","workshop_id");--> statement-breakpoint
CREATE INDEX "idx_workshop_registrations_user" ON "workshop_registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_workshop_registrations_workshop" ON "workshop_registrations" USING btree ("workshop_id");--> statement-breakpoint
CREATE INDEX "idx_workshops_date" ON "workshops" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_workshops_event_date" ON "workshops" USING btree ("event_name","date");--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admins_email" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_admins_role" ON "admins" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_admins_status" ON "admins" USING btree ("status");