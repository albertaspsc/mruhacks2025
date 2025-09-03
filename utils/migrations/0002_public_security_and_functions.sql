-- Functions
CREATE OR REPLACE FUNCTION "public"."cleanup_expired_email_changes"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  UPDATE public.users 
  SET 
    pending_email = NULL,
    email_change_requested_at = NULL
  WHERE 
    pending_email IS NOT NULL 
    AND email_change_requested_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  UPDATE public.profile 
  SET 
    pending_email = NULL,
    email_change_requested_at = NULL
  WHERE 
    pending_email IS NOT NULL 
    AND email_change_requested_at < NOW() - INTERVAL '24 hours';
  
  RETURN cleanup_count;
END;
$$;--> statement-breakpoint

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
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."delete_user_completely"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  DELETE FROM public.profile WHERE id = current_user_id;
  DELETE FROM public.users WHERE id = current_user_id;
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."get_all_users_for_admin"() RETURNS SETOF "public"."users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  RETURN QUERY
  SELECT * FROM users
  ORDER BY timestamp DESC NULLS LAST;
END;
$$;--> statement-breakpoint

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
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."is_super_admin"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = user_id 
    AND role = 'super_admin'::admin_role 
    AND status = 'active'::admin_status
  );
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."sync_confirmed_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF OLD.email != NEW.email AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users 
    SET 
      email = NEW.email,
      pending_email = NULL,
      email_change_requested_at = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
    UPDATE public.profile 
    SET 
      email = NEW.email,
      pending_email = NULL,
      email_change_requested_at = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."toggle_user_checkin_admin"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  UPDATE users 
  SET checked_in = NOT COALESCE(checked_in, FALSE)
  WHERE id = user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."update_user_status_admin"("user_id" "uuid", "new_status" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  UPDATE users 
  SET status = new_status
  WHERE id = user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "public"."update_users_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.timestamp := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;--> statement-breakpoint

-- View
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
  ORDER BY "a"."created_at" DESC;--> statement-breakpoint

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_admins_email" ON "public"."admins" USING "btree" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admins_role" ON "public"."admins" USING "btree" ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admins_status" ON "public"."admins" USING "btree" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_resume_url" ON "public"."users" USING "btree" ("resume_url") WHERE ("resume_url" IS NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workshop_registrations_user" ON "public"."workshop_registrations" USING "btree" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workshop_registrations_workshop" ON "public"."workshop_registrations" USING "btree" ("workshop_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workshops_date" ON "public"."workshops" USING "btree" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workshops_event_date" ON "public"."workshops" USING "btree" ("event_name", "date");--> statement-breakpoint

-- Triggers
CREATE OR REPLACE TRIGGER "set_users_timestamp" BEFORE INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_users_timestamp"();--> statement-breakpoint
CREATE OR REPLACE TRIGGER "update_admins_updated_at" BEFORE UPDATE ON "public"."admins" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();--> statement-breakpoint

-- Enable RLS
ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."mktg_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."parking_info" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."user_diet_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."user_interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."workshop_registrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."workshops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Policies
CREATE POLICY "Admins can update parking info" ON "public"."parking_info" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."id" = "auth"."uid"()) AND ("admins"."status" = 'active'::"public"."admin_status")))));--> statement-breakpoint

CREATE POLICY "Admins can view all marketing preferences" ON "public"."mktg_preferences" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."id" = "auth"."uid"()) AND ("admins"."status" = 'active'::"public"."admin_status")))));--> statement-breakpoint

CREATE POLICY "Admins can view all parking info" ON "public"."parking_info" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE (("admins"."id" = "auth"."uid"()) AND ("admins"."status" = 'active'::"public"."admin_status")))));--> statement-breakpoint

CREATE POLICY "Allow admin read access to registrations" ON "public"."workshop_registrations" FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint

CREATE POLICY "Authenticated users can delete workshops" ON "public"."workshops" FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint

CREATE POLICY "Authenticated users can insert workshops" ON "public"."workshops" FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint

CREATE POLICY "Authenticated users can read registrations" ON "public"."workshop_registrations" FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint

CREATE POLICY "Authenticated users can update workshops" ON "public"."workshops" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint

CREATE POLICY "Only authenticated users can view workshops" ON "public"."workshops" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));--> statement-breakpoint

CREATE POLICY "Users can delete own marketing preferences" ON "public"."mktg_preferences" FOR DELETE USING (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can delete own parking info" ON "public"."parking_info" FOR DELETE USING (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can delete their own profile" ON "public"."profile" FOR DELETE USING (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can delete their own registrations" ON "public"."users" FOR DELETE USING (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can insert own marketing preferences" ON "public"."mktg_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can insert own parking info" ON "public"."parking_info" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can register for workshops" ON "public"."workshop_registrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));--> statement-breakpoint

CREATE POLICY "Users can unregister from workshops" ON "public"."workshop_registrations" FOR DELETE USING (("auth"."uid"() = "user_id"));--> statement-breakpoint

CREATE POLICY "Users can update own marketing preferences" ON "public"."mktg_preferences" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can update own parking info" ON "public"."parking_info" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can view own marketing preferences" ON "public"."mktg_preferences" FOR SELECT USING (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can view own parking info" ON "public"."parking_info" FOR SELECT USING (("auth"."uid"() = "id"));--> statement-breakpoint

CREATE POLICY "Users can view their own registrations" ON "public"."workshop_registrations" FOR SELECT USING (("auth"."uid"() = "user_id"));--> statement-breakpoint

CREATE POLICY "Workshops are viewable by everyone" ON "public"."workshops" FOR SELECT USING (("is_active" = true));--> statement-breakpoint

CREATE POLICY "admin_delete" ON "public"."admins" FOR DELETE TO "authenticated" USING (("public"."is_super_admin"() AND ("auth"."uid"() <> "id")));--> statement-breakpoint

CREATE POLICY "admin_insert" ON "public"."admins" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_super_admin"());--> statement-breakpoint

CREATE POLICY "admin_update" ON "public"."admins" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_super_admin"()));--> statement-breakpoint

CREATE POLICY "admin_view_own" ON "public"."admins" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_super_admin"()));--> statement-breakpoint

CREATE POLICY "dietary_restrictions_select_all" ON "public"."dietary_restrictions" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "experience_types_select_all" ON "public"."experience_types" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "gender_select_all" ON "public"."gender" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "interests_select_all" ON "public"."interests" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "majors_insert_authenticated" ON "public"."majors" FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "majors_select_all" ON "public"."majors" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "marketing_types_select_all" ON "public"."marketing_types" FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "universities_insert_authenticated" ON "public"."universities" FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "universities_select_all" ON "public"."universities" FOR SELECT USING (true);--> statement-breakpoint

-- Grants
GRANT USAGE ON SCHEMA "public" TO "postgres";--> statement-breakpoint
GRANT USAGE ON SCHEMA "public" TO "authenticated";--> statement-breakpoint
GRANT USAGE ON SCHEMA "public" TO "service_role";--> statement-breakpoint

GRANT ALL ON FUNCTION "public"."cleanup_expired_email_changes"() TO "anon";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."cleanup_expired_email_changes"() TO "authenticated";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."cleanup_expired_email_changes"() TO "service_role";--> statement-breakpoint

GRANT ALL ON FUNCTION "public"."copy_user_to_profiles"() TO "service_role";--> statement-breakpoint

GRANT ALL ON FUNCTION "public"."delete_user_completely"() TO "anon";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."delete_user_completely"() TO "authenticated";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."delete_user_completely"() TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."users" TO "service_role";--> statement-breakpoint
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."users" TO "authenticated";--> statement-breakpoint

GRANT ALL ON FUNCTION "public"."get_all_users_for_admin"() TO "service_role";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."is_super_admin"("user_id" "uuid") TO "service_role";--> statement-breakpoint

GRANT ALL ON FUNCTION "public"."sync_confirmed_email"() TO "anon";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."sync_confirmed_email"() TO "authenticated";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."sync_confirmed_email"() TO "service_role";--> statement-breakpoint

GRANT ALL ON FUNCTION "public"."toggle_user_checkin_admin"("user_id" "uuid") TO "service_role";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."update_user_status_admin"("user_id" "uuid", "new_status" "text") TO "service_role";--> statement-breakpoint
GRANT ALL ON FUNCTION "public"."update_users_timestamp"() TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."admins" TO "service_role";--> statement-breakpoint
GRANT ALL ON TABLE "public"."admins" TO "authenticated";--> statement-breakpoint
GRANT ALL ON TABLE "public"."admins" TO "anon";--> statement-breakpoint
GRANT ALL ON TABLE "public"."admin_management_view" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."dietary_restrictions" TO "service_role";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."dietary_restrictions" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."dietary_restrictions" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."dietary_restrictions_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."experience_types" TO "service_role";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."experience_types" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."experience_types" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."experience_types_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."gender" TO "service_role";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."gender" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."gender" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."gender_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."interests" TO "service_role";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."interests" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."interests" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."interests_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."majors" TO "service_role";--> statement-breakpoint
GRANT SELECT,INSERT ON TABLE "public"."majors" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."majors" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."majors_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."marketing_types" TO "service_role";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."marketing_types" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."marketing_types" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."marketing_types_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."mktg_preferences" TO "service_role";--> statement-breakpoint
GRANT ALL ON TABLE "public"."mktg_preferences" TO "authenticated";--> statement-breakpoint

GRANT ALL ON TABLE "public"."parking_info" TO "service_role";--> statement-breakpoint
GRANT ALL ON TABLE "public"."parking_info" TO "authenticated";--> statement-breakpoint

GRANT ALL ON TABLE "public"."profile" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."universities" TO "service_role";--> statement-breakpoint
GRANT SELECT,INSERT ON TABLE "public"."universities" TO "authenticated";--> statement-breakpoint
GRANT SELECT ON TABLE "public"."universities" TO "anon";--> statement-breakpoint
GRANT ALL ON SEQUENCE "public"."universities_id_seq" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."user_diet_restrictions" TO "service_role";--> statement-breakpoint
GRANT SELECT,INSERT,DELETE ON TABLE "public"."user_diet_restrictions" TO "authenticated";--> statement-breakpoint

GRANT ALL ON TABLE "public"."user_interests" TO "service_role";--> statement-breakpoint
GRANT SELECT,INSERT,DELETE ON TABLE "public"."user_interests" TO "authenticated";--> statement-breakpoint

GRANT ALL ON TABLE "public"."workshop_registrations" TO "anon";--> statement-breakpoint
GRANT ALL ON TABLE "public"."workshop_registrations" TO "authenticated";--> statement-breakpoint
GRANT ALL ON TABLE "public"."workshop_registrations" TO "service_role";--> statement-breakpoint

GRANT ALL ON TABLE "public"."workshops" TO "anon";--> statement-breakpoint
GRANT ALL ON TABLE "public"."workshops" TO "authenticated";--> statement-breakpoint
GRANT ALL ON TABLE "public"."workshops" TO "service_role";--> statement-breakpoint

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";--> statement-breakpoint

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";--> statement-breakpoint

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";--> statement-breakpoint
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";--> statement-breakpoint


