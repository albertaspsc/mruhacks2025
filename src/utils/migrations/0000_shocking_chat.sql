-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TYPE "auth"."aal_level" AS ENUM('aal1', 'aal2', 'aal3');--> statement-breakpoint
CREATE TYPE "auth"."code_challenge_method" AS ENUM('s256', 'plain');--> statement-breakpoint
CREATE TYPE "auth"."factor_status" AS ENUM('unverified', 'verified');--> statement-breakpoint
CREATE TYPE "auth"."factor_type" AS ENUM('totp', 'webauthn', 'phone');--> statement-breakpoint
CREATE TYPE "auth"."oauth_registration_type" AS ENUM('dynamic', 'manual');--> statement-breakpoint
CREATE TYPE "auth"."one_time_token_type" AS ENUM('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('admin', 'super_admin', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."admin_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."parking_state" AS ENUM('Yes', 'No', 'Not sure');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('confirmed', 'pending', 'waitlisted');--> statement-breakpoint
CREATE TYPE "public"."year_of_study" AS ENUM('1st', '2nd', '3rd', '4th+', 'Recent Grad');--> statement-breakpoint
CREATE TABLE "auth"."instances" (
	"id" uuid NOT NULL,
	"uuid" uuid,
	"raw_base_config" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"instance_id" uuid,
	"id" uuid NOT NULL,
	"aud" varchar(255),
	"role" varchar(255),
	"email" varchar(255),
	"encrypted_password" varchar(255),
	"email_confirmed_at" timestamp with time zone,
	"invited_at" timestamp with time zone,
	"confirmation_token" varchar(255),
	"confirmation_sent_at" timestamp with time zone,
	"recovery_token" varchar(255),
	"recovery_sent_at" timestamp with time zone,
	"email_change_token_new" varchar(255),
	"email_change" varchar(255),
	"email_change_sent_at" timestamp with time zone,
	"last_sign_in_at" timestamp with time zone,
	"raw_app_meta_data" jsonb,
	"raw_user_meta_data" jsonb,
	"is_super_admin" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"phone" text DEFAULT NULL,
	"phone_confirmed_at" timestamp with time zone,
	"phone_change" text DEFAULT '',
	"phone_change_token" varchar(255) DEFAULT '',
	"phone_change_sent_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
	"email_change_token_current" varchar(255) DEFAULT '',
	"email_change_confirm_status" smallint DEFAULT 0,
	"banned_until" timestamp with time zone,
	"reauthentication_token" varchar(255) DEFAULT '',
	"reauthentication_sent_at" timestamp with time zone,
	"is_sso_user" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_change_confirm_status_check" CHECK ((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2))
);
--> statement-breakpoint
ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."audit_log_entries" (
	"instance_id" uuid,
	"id" uuid NOT NULL,
	"payload" json,
	"created_at" timestamp with time zone,
	"ip_address" varchar(64) DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."saml_relay_states" (
	"id" uuid NOT NULL,
	"sso_provider_id" uuid NOT NULL,
	"request_id" text NOT NULL,
	"for_email" text,
	"redirect_to" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"flow_state_id" uuid,
	CONSTRAINT "request_id not empty" CHECK (char_length(request_id) > 0)
);
--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."refresh_tokens" (
	"instance_id" uuid,
	"id" bigserial NOT NULL,
	"token" varchar(255),
	"user_id" varchar(255),
	"revoked" boolean,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"parent" varchar(255),
	"session_id" uuid
);
--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"factor_id" uuid,
	"aal" "auth"."aal_level",
	"not_after" timestamp with time zone,
	"refreshed_at" timestamp,
	"user_agent" text,
	"ip" "inet",
	"tag" text
);
--> statement-breakpoint
ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."sso_domains" (
	"id" uuid NOT NULL,
	"sso_provider_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "domain not empty" CHECK (char_length(domain) > 0)
);
--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."mfa_amr_claims" (
	"session_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"authentication_method" text NOT NULL,
	"id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."saml_providers" (
	"id" uuid NOT NULL,
	"sso_provider_id" uuid NOT NULL,
	"entity_id" text NOT NULL,
	"metadata_xml" text NOT NULL,
	"metadata_url" text,
	"attribute_mapping" jsonb,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"name_id_format" text,
	CONSTRAINT "metadata_xml not empty" CHECK (char_length(metadata_xml) > 0),
	CONSTRAINT "metadata_url not empty" CHECK ((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)),
	CONSTRAINT "entity_id not empty" CHECK (char_length(entity_id) > 0)
);
--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."flow_state" (
	"id" uuid NOT NULL,
	"user_id" uuid,
	"auth_code" text NOT NULL,
	"code_challenge_method" "auth"."code_challenge_method" NOT NULL,
	"code_challenge" text NOT NULL,
	"provider_type" text NOT NULL,
	"provider_access_token" text,
	"provider_refresh_token" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"authentication_method" text NOT NULL,
	"auth_code_issued_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."identities" (
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"identity_data" jsonb NOT NULL,
	"provider" text NOT NULL,
	"last_sign_in_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"email" text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."one_time_tokens" (
	"id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"token_type" "auth"."one_time_token_type" NOT NULL,
	"token_hash" text NOT NULL,
	"relates_to" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "one_time_tokens_token_hash_check" CHECK (char_length(token_hash) > 0)
);
--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."mfa_factors" (
	"id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"friendly_name" text,
	"factor_type" "auth"."factor_type" NOT NULL,
	"status" "auth"."factor_status" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"secret" text,
	"phone" text,
	"last_challenged_at" timestamp with time zone,
	"web_authn_credential" jsonb,
	"web_authn_aaguid" uuid
);
--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."mfa_challenges" (
	"id" uuid NOT NULL,
	"factor_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"ip_address" "inet" NOT NULL,
	"otp_code" text,
	"web_authn_session_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."sso_providers" (
	"id" uuid NOT NULL,
	"resource_id" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"disabled" boolean,
	CONSTRAINT "resource_id not empty" CHECK ((resource_id = NULL::text) OR (char_length(resource_id) > 0))
);
--> statement-breakpoint
ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."oauth_clients" (
	"id" uuid NOT NULL,
	"client_id" text NOT NULL,
	"client_secret_hash" text NOT NULL,
	"registration_type" "auth"."oauth_registration_type" NOT NULL,
	"redirect_uris" text NOT NULL,
	"grant_types" text NOT NULL,
	"client_name" text,
	"client_uri" text,
	"logo_uri" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "oauth_clients_client_name_length" CHECK (char_length(client_name) <= 1024),
	CONSTRAINT "oauth_clients_client_uri_length" CHECK (char_length(client_uri) <= 2048),
	CONSTRAINT "oauth_clients_logo_uri_length" CHECK (char_length(logo_uri) <= 2048)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"f_name" varchar(255) NOT NULL,
	"l_name" varchar(255) NOT NULL,
	"gender" integer NOT NULL,
	"university" integer NOT NULL,
	"prev_attendance" boolean NOT NULL,
	"major" integer NOT NULL,
	"parking" "parking_state" NOT NULL,
	"email" varchar(255) NOT NULL,
	"yearOfStudy" "year_of_study" NOT NULL,
	"experience" integer NOT NULL,
	"accommodations" text NOT NULL,
	"marketing" integer NOT NULL,
	"timestamp" timestamp,
	"status" "status" DEFAULT 'waitlisted' NOT NULL,
	"checked_in" boolean DEFAULT false,
	"resume_url" text,
	"resume_filename" varchar(255),
	"pending_email" text,
	"email_change_requested_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_admin_only" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"f_name" varchar(100),
	"l_name" varchar(100),
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"status" "admin_status" DEFAULT 'active' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "dietary_restrictions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dietary_restrictions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"restriction" varchar(255) NOT NULL,
	CONSTRAINT "dietary_restrictions_restriction_unique" UNIQUE("restriction")
);
--> statement-breakpoint
ALTER TABLE "dietary_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experience_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "experience_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"experience" varchar(255) NOT NULL,
	CONSTRAINT "experience_types_experience_unique" UNIQUE("experience")
);
--> statement-breakpoint
ALTER TABLE "experience_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "gender" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gender_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"gender" varchar(255) NOT NULL,
	CONSTRAINT "gender_gender_unique" UNIQUE("gender")
);
--> statement-breakpoint
ALTER TABLE "gender" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "interests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"interest" varchar(255) NOT NULL,
	CONSTRAINT "interests_interest_unique" UNIQUE("interest")
);
--> statement-breakpoint
ALTER TABLE "interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "majors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "majors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"major" varchar(255) NOT NULL,
	CONSTRAINT "majors_major_unique" UNIQUE("major")
);
--> statement-breakpoint
ALTER TABLE "majors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "marketing_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "marketing_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"marketing" varchar(255) NOT NULL,
	CONSTRAINT "marketing_types_marketing_unique" UNIQUE("marketing")
);
--> statement-breakpoint
ALTER TABLE "marketing_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "mktg_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"send_emails" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mktg_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "parking_info" (
	"id" uuid PRIMARY KEY NOT NULL,
	"license_plate" varchar(8) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parking_info" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"f_name" varchar(255),
	"l_name" varchar(255),
	"marketing_emails" boolean DEFAULT false,
	"parking" varchar(10) DEFAULT 'Not sure',
	"license_plate" varchar(20),
	"pending_email" text,
	"email_change_requested_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profile_parking_check" CHECK ((parking)::text = ANY (ARRAY[('Yes'::character varying)::text, ('No'::character varying)::text, ('Not sure'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "universities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "universities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uni" varchar(255) NOT NULL,
	CONSTRAINT "universities_uni_unique" UNIQUE("uni")
);
--> statement-breakpoint
ALTER TABLE "universities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_diet_restrictions" (
	"id" uuid NOT NULL,
	"restriction" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_interests" (
	"id" uuid NOT NULL,
	"interest" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_interests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workshop_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workshop_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now(),
	"f_name" varchar(255),
	"l_name" varchar(255),
	"yearOfStudy" varchar(50),
	"gender" varchar(50),
	"major" varchar(255),
	CONSTRAINT "workshop_registrations_user_id_workshop_id_key" UNIQUE("user_id","workshop_id")
);
--> statement-breakpoint
ALTER TABLE "workshop_registrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
ALTER TABLE "workshops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "auth"."schema_migrations" (
	"version" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pre_reg" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "pre_reg_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"time" timestamp with time zone NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pre_reg" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_experience_experience_types_id_fk" FOREIGN KEY ("experience") REFERENCES "public"."experience_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gender_gender_id_fk" FOREIGN KEY ("gender") REFERENCES "public"."gender"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_major_majors_id_fk" FOREIGN KEY ("major") REFERENCES "public"."majors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_marketing_marketing_types_id_fk" FOREIGN KEY ("marketing") REFERENCES "public"."marketing_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_universities_id_fk" FOREIGN KEY ("university") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mktg_preferences" ADD CONSTRAINT "mktg_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mktg_preferences" ADD CONSTRAINT "mktg_preferences_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_info" ADD CONSTRAINT "parking_info_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_auth_user_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_restriction_dietary_restrictions_id_fk" FOREIGN KEY ("restriction") REFERENCES "public"."dietary_restrictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_diet_restrictions" ADD CONSTRAINT "user_diet_restrictions_user_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interest_interests_id_fk" FOREIGN KEY ("interest") REFERENCES "public"."interests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING btree ("confirmation_token" text_ops) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING btree ("email_change_token_current" text_ops) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING btree ("email_change_token_new" text_ops) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING btree ("reauthentication_token" text_ops) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING btree ("recovery_token" text_ops) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING btree ("email" text_ops) WHERE (is_sso_user = false);--> statement-breakpoint
CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING btree (instance_id uuid_ops,lower((email)::text) uuid_ops);--> statement-breakpoint
CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING btree ("instance_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING btree ("is_anonymous" bool_ops);--> statement-breakpoint
CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING btree ("instance_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING btree ("for_email" text_ops);--> statement-breakpoint
CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING btree ("sso_provider_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING btree ("instance_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING btree ("instance_id" text_ops,"user_id" text_ops);--> statement-breakpoint
CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING btree ("parent" text_ops);--> statement-breakpoint
CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING btree ("session_id" bool_ops,"revoked" bool_ops);--> statement-breakpoint
CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING btree ("updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING btree ("not_after" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING btree ("user_id" uuid_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING btree (lower(domain) text_ops);--> statement-breakpoint
CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING btree ("sso_provider_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING btree ("sso_provider_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING btree ("auth_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING btree ("user_id" uuid_ops,"authentication_method" uuid_ops);--> statement-breakpoint
CREATE INDEX "identities_email_idx" ON "auth"."identities" USING btree ("email" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING hash ("relates_to" text_ops);--> statement-breakpoint
CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING hash ("token_hash" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING btree ("user_id" uuid_ops,"token_type" uuid_ops);--> statement-breakpoint
CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING btree ("user_id" timestamptz_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING btree ("friendly_name" text_ops,"user_id" uuid_ops) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);--> statement-breakpoint
CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING btree ("user_id" text_ops,"phone" text_ops);--> statement-breakpoint
CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING btree (lower(resource_id) text_ops);--> statement-breakpoint
CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING btree ("resource_id" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "oauth_clients_client_id_idx" ON "auth"."oauth_clients" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" USING btree ("deleted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_users_resume_url" ON "users" USING btree ("resume_url" text_ops) WHERE (resume_url IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_admins_email" ON "admins" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_admins_role" ON "admins" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_admins_status" ON "admins" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_workshop_registrations_user" ON "workshop_registrations" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_workshop_registrations_workshop" ON "workshop_registrations" USING btree ("workshop_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_workshops_date" ON "workshops" USING btree ("date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_workshops_event_date" ON "workshops" USING btree ("event_name" date_ops,"date" date_ops);--> statement-breakpoint
CREATE VIEW "public"."admin_management_view" AS (SELECT a.id, a.email, a.role, a.status, a.f_name AS "firstName", a.l_name AS "lastName", a.is_admin_only, a.created_at, a.updated_at, u.last_sign_in_at, u.email_confirmed_at FROM admins a JOIN auth.users u ON a.id = u.id ORDER BY a.created_at DESC);--> statement-breakpoint
CREATE VIEW "public"."rsvpable_users" AS (SELECT u.id FROM users u LEFT JOIN pre_reg p ON p.email = u.email::text WHERE u.status = ANY (ARRAY['pending'::status, 'waitlisted'::status]) ORDER BY (p.email IS NOT NULL) DESC, u.updated_at LIMIT 145);--> statement-breakpoint
CREATE POLICY "Users can delete their own registrations" ON "users" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "users_insert_own" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_update_own" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "admin_delete" ON "admins" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((is_super_admin() AND (auth.uid() <> id)));--> statement-breakpoint
CREATE POLICY "admin_insert" ON "admins" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "admin_update" ON "admins" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "admin_view_own" ON "admins" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "dietary_restrictions_select_all" ON "dietary_restrictions" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "experience_types_select_all" ON "experience_types" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "gender_select_all" ON "gender" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "interests_select_all" ON "interests" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "majors_insert_authenticated" ON "majors" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "majors_select_all" ON "majors" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "marketing_types_select_all" ON "marketing_types" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Admins can view all marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status)))));--> statement-breakpoint
CREATE POLICY "Users can delete own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can insert own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own marketing preferences" ON "mktg_preferences" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can update parking info" ON "parking_info" AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status)))));--> statement-breakpoint
CREATE POLICY "Admins can view all parking info" ON "parking_info" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete own parking info" ON "parking_info" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can insert own parking info" ON "parking_info" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update own parking info" ON "parking_info" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own parking info" ON "parking_info" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own profile" ON "profile" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "users_insert_own_profile" ON "profile" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_update_own_profile" ON "profile" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "users_view_own_profile" ON "profile" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "universities_insert_authenticated" ON "universities" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "universities_select_all" ON "universities" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "user_restrictions_insert_own" ON "user_diet_restrictions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "user_restrictions_select_own" ON "user_diet_restrictions" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "user_interests_insert_own" ON "user_interests" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "user_interests_select_own" ON "user_interests" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Allow admin read access to registrations" ON "workshop_registrations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can read registrations" ON "workshop_registrations" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can register for workshops" ON "workshop_registrations" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can unregister from workshops" ON "workshop_registrations" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own registrations" ON "workshop_registrations" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Authenticated users can delete workshops" ON "workshops" AS PERMISSIVE FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated users can insert workshops" ON "workshops" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Authenticated users can update workshops" ON "workshops" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Only authenticated users can view workshops" ON "workshops" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Workshops are viewable by everyone" ON "workshops" AS PERMISSIVE FOR SELECT TO public;
*/