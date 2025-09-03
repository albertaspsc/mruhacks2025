-- Align existing tables and add missing ones to match Supabase public schema

-- users table adjustments
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'year_of_study'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'yearOfStudy'
  ) THEN
    ALTER TABLE "public"."users" RENAME COLUMN "year_of_study" TO "yearOfStudy";
  END IF;
END $$;--> statement-breakpoint

ALTER TABLE "public"."users" 
  ALTER COLUMN "status" SET DEFAULT 'waitlisted'::"public"."status";--> statement-breakpoint

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'resume_url' AND data_type <> 'text'
  ) THEN
    ALTER TABLE "public"."users" 
      ALTER COLUMN "resume_url" TYPE text USING "resume_url"::text;
  END IF;
END $$;--> statement-breakpoint

ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "pending_email" text,
  ADD COLUMN IF NOT EXISTS "email_change_requested_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();--> statement-breakpoint

-- admins table adjustments
ALTER TABLE "public"."admins"
  ALTER COLUMN "role" SET DEFAULT 'admin'::"public"."admin_role",
  ALTER COLUMN "status" SET DEFAULT 'active'::"public"."admin_status";--> statement-breakpoint

ALTER TABLE "public"."admins"
  ADD COLUMN IF NOT EXISTS "is_admin_only" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "f_name" varchar(100),
  ADD COLUMN IF NOT EXISTS "l_name" varchar(100),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now() NOT NULL;--> statement-breakpoint

-- profile table adjustments
ALTER TABLE "public"."profile"
  ADD COLUMN IF NOT EXISTS "marketing_emails" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "parking" varchar(10) DEFAULT 'Not sure',
  ADD COLUMN IF NOT EXISTS "license_plate" varchar(20),
  ADD COLUMN IF NOT EXISTS "pending_email" text,
  ADD COLUMN IF NOT EXISTS "email_change_requested_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now();--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'profile' AND c.conname = 'profile_parking_check'
  ) THEN
    ALTER TABLE "public"."profile"
      ADD CONSTRAINT "profile_parking_check" CHECK (("parking"::text = ANY ((ARRAY['Yes'::varchar, 'No'::varchar, 'Not sure'::varchar])::text[])));
  END IF;
END $$;--> statement-breakpoint

-- New tables: workshops & workshop_registrations
CREATE TABLE IF NOT EXISTS "public"."workshops" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "event_name" varchar(255) NOT NULL,
  "date" date NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "location" varchar(255),
  "max_capacity" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "public"."workshop_registrations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "workshop_id" uuid NOT NULL,
  "registered_at" timestamptz DEFAULT now(),
  "f_name" varchar(255),
  "l_name" varchar(255),
  "yearOfStudy" varchar(50),
  "gender" varchar(50),
  "major" varchar(255),
  CONSTRAINT "workshop_registrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workshop_registrations_user_id_workshop_id_key" UNIQUE ("user_id", "workshop_id")
);--> statement-breakpoint

-- FKs for new tables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'workshop_registrations' AND c.conname = 'workshop_registrations_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."workshop_registrations"
      ADD CONSTRAINT "workshop_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'workshop_registrations' AND c.conname = 'workshop_registrations_workshop_id_fkey'
  ) THEN
    ALTER TABLE "public"."workshop_registrations"
      ADD CONSTRAINT "workshop_registrations_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE CASCADE;
  END IF;
END $$;--> statement-breakpoint


