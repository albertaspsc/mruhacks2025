

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admin_role" AS ENUM (
    'admin',
    'super_admin',
    'volunteer'
);


ALTER TYPE "public"."admin_role" OWNER TO "postgres";


CREATE TYPE "public"."admin_status" AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE "public"."admin_status" OWNER TO "postgres";


CREATE TYPE "public"."parking_state" AS ENUM (
    'Yes',
    'No',
    'Not sure'
);


ALTER TYPE "public"."parking_state" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'confirmed',
    'pending',
    'waitlisted'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE TYPE "public"."year_of_study" AS ENUM (
    '1st',
    '2nd',
    '3rd',
    '4th+',
    'Recent Grad'
);


ALTER TYPE "public"."year_of_study" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_email_changes"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  -- Clean up expired email change requests in users table
  UPDATE public.users 
  SET 
    pending_email = NULL,
    email_change_requested_at = NULL
  WHERE 
    pending_email IS NOT NULL 
    AND email_change_requested_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Clean up expired email change requests in profile table
  UPDATE public.profile 
  SET 
    pending_email = NULL,
    email_change_requested_at = NULL
  WHERE 
    pending_email IS NOT NULL 
    AND email_change_requested_at < NOW() - INTERVAL '24 hours';
  
  RETURN cleanup_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_email_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."copy_user_to_profiles"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  INSERT INTO public.profile (id, email, f_name, l_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 2))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."copy_user_to_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_completely"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Delete from profile table
  DELETE FROM public.profile WHERE id = current_user_id;
  
  -- Delete from users table
  DELETE FROM public.users WHERE id = current_user_id;
  
  -- Delete from auth.users table (this requires security definer)
  DELETE FROM auth.users WHERE id = current_user_id;
  
END;
$$;


ALTER FUNCTION "public"."delete_user_completely"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "f_name" character varying(255) NOT NULL,
    "l_name" character varying(255) NOT NULL,
    "gender" integer NOT NULL,
    "university" integer NOT NULL,
    "prev_attendance" boolean NOT NULL,
    "major" integer NOT NULL,
    "parking" "public"."parking_state" NOT NULL,
    "email" character varying(255) NOT NULL,
    "yearOfStudy" "public"."year_of_study" NOT NULL,
    "experience" integer NOT NULL,
    "accommodations" "text" NOT NULL,
    "marketing" integer NOT NULL,
    "timestamp" timestamp without time zone,
    "status" "public"."status" DEFAULT 'waitlisted'::"public"."status" NOT NULL,
    "checked_in" boolean DEFAULT false,
    "resume_url" "text",
    "resume_filename" character varying(255),
    "pending_email" "text",
    "email_change_requested_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_users_for_admin"() RETURNS SETOF "public"."users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return all users from public.users table
  RETURN QUERY
  SELECT * FROM users
  ORDER BY timestamp DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_all_users_for_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.id = auth.uid() 
        AND admins.status = 'active'
    );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- This function runs with definer's rights (bypasses RLS)
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = user_id 
    AND role = 'super_admin'::admin_role 
    AND status = 'active'::admin_status
  );
END;
$$;


ALTER FUNCTION "public"."is_super_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_confirmed_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Only proceed if email actually changed and is confirmed
  IF OLD.email != NEW.email AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Update public.users table
    UPDATE public.users 
    SET 
      email = NEW.email,
      pending_email = NULL,
      email_change_requested_at = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Update public.profile table
    UPDATE public.profile 
    SET 
      email = NEW.email,
      pending_email = NULL,
      email_change_requested_at = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;  -- Changed from user_id to id
    
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_confirmed_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_user_checkin_admin"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Toggle check-in status
  UPDATE users 
  SET checked_in = NOT COALESCE(checked_in, FALSE)
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;


ALTER FUNCTION "public"."toggle_user_checkin_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_status_admin"("user_id" "uuid", "new_status" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update user status
  UPDATE users 
  SET status = new_status
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_user_status_admin"("user_id" "uuid", "new_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_users_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.timestamp := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_users_timestamp"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "is_admin_only" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "f_name" character varying(100),
    "l_name" character varying(100),
    "role" "public"."admin_role" DEFAULT 'admin'::"public"."admin_role" NOT NULL,
    "status" "public"."admin_status" DEFAULT 'active'::"public"."admin_status" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_management_view" AS
 SELECT "a"."id",
    "a"."email",
    "a"."role",
    "a"."status",
    "a"."f_name" AS "firstName",
    "a"."l_name" AS "lastName",
    "a"."is_admin_only",
    "a"."created_at",
    "a"."updated_at",
    "u"."last_sign_in_at",
    "u"."email_confirmed_at"
   FROM ("public"."admins" "a"
     JOIN "auth"."users" "u" ON (("a"."id" = "u"."id")))
  ORDER BY "a"."created_at" DESC;


ALTER VIEW "public"."admin_management_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dietary_restrictions" (
    "id" integer NOT NULL,
    "restriction" character varying(255) NOT NULL
);


ALTER TABLE "public"."dietary_restrictions" OWNER TO "postgres";


ALTER TABLE "public"."dietary_restrictions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."dietary_restrictions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."experience_types" (
    "id" integer NOT NULL,
    "experience" character varying(255) NOT NULL
);


ALTER TABLE "public"."experience_types" OWNER TO "postgres";


ALTER TABLE "public"."experience_types" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."experience_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."gender" (
    "id" integer NOT NULL,
    "gender" character varying(255) NOT NULL
);


ALTER TABLE "public"."gender" OWNER TO "postgres";


ALTER TABLE "public"."gender" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."gender_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interests" (
    "id" integer NOT NULL,
    "interest" character varying(255) NOT NULL
);


ALTER TABLE "public"."interests" OWNER TO "postgres";


ALTER TABLE "public"."interests" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."interests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."majors" (
    "id" integer NOT NULL,
    "major" character varying(255) NOT NULL
);


ALTER TABLE "public"."majors" OWNER TO "postgres";


ALTER TABLE "public"."majors" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."majors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."marketing_types" (
    "id" integer NOT NULL,
    "marketing" character varying(255) NOT NULL
);


ALTER TABLE "public"."marketing_types" OWNER TO "postgres";


ALTER TABLE "public"."marketing_types" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."marketing_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."mktg_preferences" (
    "id" "uuid" NOT NULL,
    "send_emails" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."mktg_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parking_info" (
    "id" "uuid" NOT NULL,
    "license_plate" character varying(8) NOT NULL
);


ALTER TABLE "public"."parking_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "f_name" character varying(255),
    "l_name" character varying(255),
    "marketing_emails" boolean DEFAULT false,
    "parking" character varying(10) DEFAULT 'Not sure'::character varying,
    "license_plate" character varying(20),
    "pending_email" "text",
    "email_change_requested_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profile_parking_check" CHECK ((("parking")::"text" = ANY ((ARRAY['Yes'::character varying, 'No'::character varying, 'Not sure'::character varying])::"text"[])))
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."universities" (
    "id" integer NOT NULL,
    "uni" character varying(255) NOT NULL
);


ALTER TABLE "public"."universities" OWNER TO "postgres";


ALTER TABLE "public"."universities" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."universities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_diet_restrictions" (
    "id" "uuid" NOT NULL,
    "restriction" integer NOT NULL
);


ALTER TABLE "public"."user_diet_restrictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_interests" (
    "id" "uuid" NOT NULL,
    "interest" integer NOT NULL
);


ALTER TABLE "public"."user_interests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workshop_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "workshop_id" "uuid" NOT NULL,
    "registered_at" timestamp with time zone DEFAULT "now"(),
    "f_name" character varying(255),
    "l_name" character varying(255),
    "yearOfStudy" character varying(50),
    "gender" character varying(50),
    "major" character varying(255)
);


ALTER TABLE "public"."workshop_registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workshops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "event_name" character varying(255) NOT NULL,
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "location" character varying(255),
    "max_capacity" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workshops" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dietary_restrictions"
    ADD CONSTRAINT "dietary_restrictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dietary_restrictions"
    ADD CONSTRAINT "dietary_restrictions_restriction_unique" UNIQUE ("restriction");



ALTER TABLE ONLY "public"."experience_types"
    ADD CONSTRAINT "experience_types_experience_unique" UNIQUE ("experience");



ALTER TABLE ONLY "public"."experience_types"
    ADD CONSTRAINT "experience_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gender"
    ADD CONSTRAINT "gender_gender_unique" UNIQUE ("gender");



ALTER TABLE ONLY "public"."gender"
    ADD CONSTRAINT "gender_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interests"
    ADD CONSTRAINT "interests_interest_unique" UNIQUE ("interest");



ALTER TABLE ONLY "public"."interests"
    ADD CONSTRAINT "interests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_major_unique" UNIQUE ("major");



ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_types"
    ADD CONSTRAINT "marketing_types_marketing_unique" UNIQUE ("marketing");



ALTER TABLE ONLY "public"."marketing_types"
    ADD CONSTRAINT "marketing_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mktg_preferences"
    ADD CONSTRAINT "mktg_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parking_info"
    ADD CONSTRAINT "parking_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."universities"
    ADD CONSTRAINT "universities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."universities"
    ADD CONSTRAINT "universities_uni_unique" UNIQUE ("uni");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workshop_registrations"
    ADD CONSTRAINT "workshop_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workshop_registrations"
    ADD CONSTRAINT "workshop_registrations_user_id_workshop_id_key" UNIQUE ("user_id", "workshop_id");



ALTER TABLE ONLY "public"."workshops"
    ADD CONSTRAINT "workshops_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admins_email" ON "public"."admins" USING "btree" ("email");



CREATE INDEX "idx_admins_role" ON "public"."admins" USING "btree" ("role");



CREATE INDEX "idx_admins_status" ON "public"."admins" USING "btree" ("status");



CREATE INDEX "idx_users_resume_url" ON "public"."users" USING "btree" ("resume_url") WHERE ("resume_url" IS NOT NULL);



CREATE INDEX "idx_workshop_registrations_user" ON "public"."workshop_registrations" USING "btree" ("user_id");



CREATE INDEX "idx_workshop_registrations_workshop" ON "public"."workshop_registrations" USING "btree" ("workshop_id");



CREATE INDEX "idx_workshops_date" ON "public"."workshops" USING "btree" ("date");



CREATE INDEX "idx_workshops_event_date" ON "public"."workshops" USING "btree" ("event_name", "date");



CREATE OR REPLACE TRIGGER "set_users_timestamp" BEFORE INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_timestamp"();



CREATE OR REPLACE TRIGGER "update_admins_updated_at" BEFORE UPDATE ON "public"."admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mktg_preferences"
    ADD CONSTRAINT "mktg_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mktg_preferences"
    ADD CONSTRAINT "mktg_preferences_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."parking_info"
    ADD CONSTRAINT "parking_info_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."parking_info"
    ADD CONSTRAINT "parking_info_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_auth_user_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_diet_restrictions"
    ADD CONSTRAINT "user_diet_restrictions_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_diet_restrictions"
    ADD CONSTRAINT "user_diet_restrictions_restriction_dietary_restrictions_id_fk" FOREIGN KEY ("restriction") REFERENCES "public"."dietary_restrictions"("id");



ALTER TABLE ONLY "public"."user_diet_restrictions"
    ADD CONSTRAINT "user_diet_restrictions_user_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_interest_interests_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."interests"("id");



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_user_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_experience_experience_types_id_fk" FOREIGN KEY ("experience") REFERENCES "public"."experience_types"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_major_majors_id_fk" FOREIGN KEY ("major") REFERENCES "public"."majors"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_marketing_marketing_types_id_fk" FOREIGN KEY ("marketing") REFERENCES "public"."marketing_types"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id");



ALTER TABLE ONLY "public"."workshop_registrations"
    ADD CONSTRAINT "workshop_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workshop_registrations"
    ADD CONSTRAINT "workshop_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workshop_registrations"
    ADD CONSTRAINT "workshop_registrations_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workshop_registrations"
    ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can update parking info" ON "public"."parking_info" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."id" = "auth"."uid"()) AND ("admins"."status" = 'active'::"public"."admin_status")))));



CREATE POLICY "Admins can view all marketing preferences" ON "public"."mktg_preferences" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."id" = "auth"."uid"()) AND ("admins"."status" = 'active'::"public"."admin_status")))));



CREATE POLICY "Admins can view all parking info" ON "public"."parking_info" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."id" = "auth"."uid"()) AND ("admins"."status" = 'active'::"public"."admin_status")))));



CREATE POLICY "Allow admin read access to registrations" ON "public"."workshop_registrations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete workshops" ON "public"."workshops" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert workshops" ON "public"."workshops" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read registrations" ON "public"."workshop_registrations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update workshops" ON "public"."workshops" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Only authenticated users can view workshops" ON "public"."workshops" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can delete own marketing preferences" ON "public"."mktg_preferences" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete own parking info" ON "public"."parking_info" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete their own profile" ON "public"."profile" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete their own registrations" ON "public"."users" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own marketing preferences" ON "public"."mktg_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own parking info" ON "public"."parking_info" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can register for workshops" ON "public"."workshop_registrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unregister from workshops" ON "public"."workshop_registrations" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own marketing preferences" ON "public"."mktg_preferences" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own parking info" ON "public"."parking_info" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own marketing preferences" ON "public"."mktg_preferences" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own parking info" ON "public"."parking_info" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own registrations" ON "public"."workshop_registrations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Workshops are viewable by everyone" ON "public"."workshops" FOR SELECT USING (("is_active" = true));



CREATE POLICY "admin_delete" ON "public"."admins" FOR DELETE TO "authenticated" USING (("public"."is_super_admin"() AND ("auth"."uid"() <> "id")));



CREATE POLICY "admin_insert" ON "public"."admins" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_super_admin"());



CREATE POLICY "admin_update" ON "public"."admins" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_super_admin"()));



CREATE POLICY "admin_view_own" ON "public"."admins" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_super_admin"()));



ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dietary_restrictions_select_all" ON "public"."dietary_restrictions" FOR SELECT USING (true);



CREATE POLICY "experience_types_select_all" ON "public"."experience_types" FOR SELECT USING (true);



CREATE POLICY "gender_select_all" ON "public"."gender" FOR SELECT USING (true);



CREATE POLICY "interests_select_all" ON "public"."interests" FOR SELECT USING (true);



CREATE POLICY "majors_insert_authenticated" ON "public"."majors" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "majors_select_all" ON "public"."majors" FOR SELECT USING (true);



CREATE POLICY "marketing_types_select_all" ON "public"."marketing_types" FOR SELECT USING (true);



ALTER TABLE "public"."mktg_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parking_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "universities_insert_authenticated" ON "public"."universities" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "universities_select_all" ON "public"."universities" FOR SELECT USING (true);



ALTER TABLE "public"."user_diet_restrictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_interests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_interests_insert_own" ON "public"."user_interests" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "user_interests_select_own" ON "public"."user_interests" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "user_restrictions_insert_own" ON "public"."user_diet_restrictions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "user_restrictions_select_own" ON "public"."user_diet_restrictions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_own" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "users_insert_own_profile" ON "public"."profile" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "users_select_own" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "users_update_own_profile" ON "public"."profile" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "users_view_own_profile" ON "public"."profile" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."workshop_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workshops" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."cleanup_expired_email_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_email_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_email_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."copy_user_to_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_completely"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_completely"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_completely"() TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."users" TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_all_users_for_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_confirmed_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_confirmed_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_confirmed_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_user_checkin_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_status_admin"("user_id" "uuid", "new_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_users_timestamp"() TO "service_role";


















GRANT ALL ON TABLE "public"."admins" TO "service_role";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "anon";



GRANT ALL ON TABLE "public"."admin_management_view" TO "service_role";



GRANT ALL ON TABLE "public"."dietary_restrictions" TO "service_role";
GRANT SELECT ON TABLE "public"."dietary_restrictions" TO "authenticated";
GRANT SELECT ON TABLE "public"."dietary_restrictions" TO "anon";



GRANT ALL ON SEQUENCE "public"."dietary_restrictions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."experience_types" TO "service_role";
GRANT SELECT ON TABLE "public"."experience_types" TO "authenticated";
GRANT SELECT ON TABLE "public"."experience_types" TO "anon";



GRANT ALL ON SEQUENCE "public"."experience_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."gender" TO "service_role";
GRANT SELECT ON TABLE "public"."gender" TO "authenticated";
GRANT SELECT ON TABLE "public"."gender" TO "anon";



GRANT ALL ON SEQUENCE "public"."gender_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interests" TO "service_role";
GRANT SELECT ON TABLE "public"."interests" TO "authenticated";
GRANT SELECT ON TABLE "public"."interests" TO "anon";



GRANT ALL ON SEQUENCE "public"."interests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."majors" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."majors" TO "authenticated";
GRANT SELECT ON TABLE "public"."majors" TO "anon";



GRANT ALL ON SEQUENCE "public"."majors_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_types" TO "service_role";
GRANT SELECT ON TABLE "public"."marketing_types" TO "authenticated";
GRANT SELECT ON TABLE "public"."marketing_types" TO "anon";



GRANT ALL ON SEQUENCE "public"."marketing_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mktg_preferences" TO "service_role";
GRANT ALL ON TABLE "public"."mktg_preferences" TO "authenticated";



GRANT ALL ON TABLE "public"."parking_info" TO "service_role";
GRANT ALL ON TABLE "public"."parking_info" TO "authenticated";



GRANT ALL ON TABLE "public"."profile" TO "service_role";



GRANT ALL ON TABLE "public"."universities" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."universities" TO "authenticated";
GRANT SELECT ON TABLE "public"."universities" TO "anon";



GRANT ALL ON SEQUENCE "public"."universities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_diet_restrictions" TO "service_role";
GRANT SELECT,INSERT,DELETE ON TABLE "public"."user_diet_restrictions" TO "authenticated";



GRANT ALL ON TABLE "public"."user_interests" TO "service_role";
GRANT SELECT,INSERT,DELETE ON TABLE "public"."user_interests" TO "authenticated";



GRANT ALL ON TABLE "public"."workshop_registrations" TO "anon";
GRANT ALL ON TABLE "public"."workshop_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."workshop_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."workshops" TO "anon";
GRANT ALL ON TABLE "public"."workshops" TO "authenticated";
GRANT ALL ON TABLE "public"."workshops" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
