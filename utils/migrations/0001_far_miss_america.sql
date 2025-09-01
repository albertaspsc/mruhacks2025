DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suspended' AND 
                 enumtypid = (SELECT oid FROM pg_type WHERE typname = 'admin_status')) THEN
    ALTER TYPE "public"."admin_status" ADD VALUE 'suspended';
  END IF;
END $$;--> statement-breakpoint

-- Create workshop_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "workshop_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workshop_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now(),
	"f_name" varchar(255),
	"l_name" varchar(255),
	"yearOfStudy" varchar(50),
	"gender" varchar(50),
	"major" varchar(255)
);--> statement-breakpoint

-- Create workshops table if it doesn't exist
CREATE TABLE IF NOT EXISTS "workshops" (
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
);--> statement-breakpoint

-- Drop constraint if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admins_id_users_id_fk') THEN
    ALTER TABLE "admins" DROP CONSTRAINT "admins_id_users_id_fk";
  END IF;
END $$;--> statement-breakpoint

-- Alter columns with IF statements
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role') THEN
    ALTER TABLE "admins" ALTER COLUMN "role" SET DEFAULT 'admin';
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'status') THEN
    ALTER TABLE "admins" ALTER COLUMN "status" SET DEFAULT 'active';
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'resume_url') THEN
    ALTER TABLE "users" ALTER COLUMN "resume_url" SET DATA TYPE text;
  END IF;
END $$;--> statement-breakpoint

-- Add columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'is_admin_only') THEN
    ALTER TABLE "admins" ADD COLUMN "is_admin_only" boolean DEFAULT true;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'created_at') THEN
    ALTER TABLE "admins" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'f_name') THEN
    ALTER TABLE "admins" ADD COLUMN "f_name" varchar(100);
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'l_name') THEN
    ALTER TABLE "admins" ADD COLUMN "l_name" varchar(100);
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'updated_at') THEN
    ALTER TABLE "admins" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile' AND column_name = 'marketing_emails') THEN
    ALTER TABLE "profile" ADD COLUMN "marketing_emails" boolean DEFAULT false;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile' AND column_name = 'parking') THEN
    ALTER TABLE "profile" ADD COLUMN "parking" varchar(10) DEFAULT 'Not sure';
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile' AND column_name = 'license_plate') THEN
    ALTER TABLE "profile" ADD COLUMN "license_plate" varchar(20);
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile' AND column_name = 'pending_email') THEN
    ALTER TABLE "profile" ADD COLUMN "pending_email" text;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile' AND column_name = 'email_change_requested_at') THEN
    ALTER TABLE "profile" ADD COLUMN "email_change_requested_at" timestamp with time zone;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile' AND column_name = 'updated_at') THEN
    ALTER TABLE "profile" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'pending_email') THEN
    ALTER TABLE "users" ADD COLUMN "pending_email" text;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_change_requested_at') THEN
    ALTER TABLE "users" ADD COLUMN "email_change_requested_at" timestamp with time zone;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();
  END IF;
END $$;--> statement-breakpoint

-- Add foreign key constraints if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshop_registrations_user_id_users_id_fk') THEN
    ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshop_registrations_workshop_id_workshops_id_fk') THEN
    ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

-- Create indexes if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'workshop_registrations_user_id_workshop_id_key') THEN
    CREATE UNIQUE INDEX "workshop_registrations_user_id_workshop_id_key" ON "workshop_registrations" USING btree ("user_id","workshop_id");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workshop_registrations_user') THEN
    CREATE INDEX "idx_workshop_registrations_user" ON "workshop_registrations" USING btree ("user_id");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workshop_registrations_workshop') THEN
    CREATE INDEX "idx_workshop_registrations_workshop" ON "workshop_registrations" USING btree ("workshop_id");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workshops_date') THEN
    CREATE INDEX "idx_workshops_date" ON "workshops" USING btree ("date");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workshops_event_date') THEN
    CREATE INDEX "idx_workshops_event_date" ON "workshops" USING btree ("event_name","date");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admins_id_users_id_fk') THEN
    ALTER TABLE "admins" ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_id_users_id_fk') THEN
    ALTER TABLE "profile" ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admins_email') THEN
    CREATE INDEX "idx_admins_email" ON "admins" USING btree ("email");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admins_role') THEN
    CREATE INDEX "idx_admins_role" ON "admins" USING btree ("role");
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admins_status') THEN
    CREATE INDEX "idx_admins_status" ON "admins" USING btree ("status");
  END IF;
END $$;