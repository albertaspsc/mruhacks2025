-- Fix users.id foreign key to reference auth.users(id)

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'users' AND c.conname = 'users_id_users_id_fk'
  ) THEN
    ALTER TABLE "public"."users" DROP CONSTRAINT "users_id_users_id_fk";
  END IF;
END $$;--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'users' AND c.conname = 'users_id_auth_users_id_fk'
  ) THEN
    ALTER TABLE "public"."users"
      ADD CONSTRAINT "users_id_auth_users_id_fk"
      FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
  END IF;
END $$;--> statement-breakpoint


