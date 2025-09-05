-- Add missing Row Level Security (RLS) policies for user_diet_restrictions table

-- First, ensure RLS is enabled on the user_diet_restrictions table (this should be a no-op if already enabled)
ALTER TABLE "public"."user_diet_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Create the policy for authenticated users to insert their own dietary restrictions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'user_diet_restrictions'
        AND policyname = 'user_restrictions_insert_own'
    ) THEN
        EXECUTE 'CREATE POLICY "user_restrictions_insert_own" ON "public"."user_diet_restrictions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint

-- Create the policy for authenticated users to view their own dietary restrictions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'user_diet_restrictions'
        AND policyname = 'user_restrictions_select_own'
    ) THEN
        EXECUTE 'CREATE POLICY "user_restrictions_select_own" ON "public"."user_diet_restrictions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"))';
    END IF;
END $$;--> statement-breakpoint
