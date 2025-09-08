-- Add Row Level Security (RLS) policies for users table if they don't already exist

-- First, ensure RLS is enabled on the users table (this should be a no-op if already enabled)
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Create the policy for users to delete their own registrations if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND policyname = 'Users can delete their own registrations'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can delete their own registrations" ON "public"."users" FOR DELETE USING (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Create the policy for authenticated users to insert their own records if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND policyname = 'users_insert_own'
    ) THEN
        EXECUTE 'CREATE POLICY "users_insert_own" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Create the policy for authenticated users to select their own records if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND policyname = 'users_select_own'
    ) THEN
        EXECUTE 'CREATE POLICY "users_select_own" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Create the policy for authenticated users to update their own records if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND policyname = 'users_update_own'
    ) THEN
        EXECUTE 'CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint
