-- Add missing Row Level Security (RLS) policies for profile table

-- First, ensure RLS is enabled on the profile table (this should be a no-op if already enabled)
ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Create the policy for authenticated users to insert their own profile if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'profile'
        AND policyname = 'users_insert_own_profile'
    ) THEN
        EXECUTE 'CREATE POLICY "users_insert_own_profile" ON "public"."profile" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Create the policy for authenticated users to update their own profile if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'profile'
        AND policyname = 'users_update_own_profile'
    ) THEN
        EXECUTE 'CREATE POLICY "users_update_own_profile" ON "public"."profile" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Create the policy for authenticated users to view their own profile if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'profile'
        AND policyname = 'users_view_own_profile'
    ) THEN
        EXECUTE 'CREATE POLICY "users_view_own_profile" ON "public"."profile" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Note: The "Users can delete their own profile" policy already exists and was created in migration 0002_public_security_and_functions.sql
