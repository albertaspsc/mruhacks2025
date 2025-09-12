-- Phase 5: Cleanup and Finalization
-- This migration cleans up old tables and finalizes the schema

-- Drop mapping functions as they're no longer needed
DROP FUNCTION IF EXISTS map_gender_to_enum(TEXT);
DROP FUNCTION IF EXISTS map_year_of_study_to_enum(TEXT);
DROP FUNCTION IF EXISTS map_experience_to_enum(TEXT);
DROP FUNCTION IF EXISTS map_marketing_to_enum(TEXT);
DROP FUNCTION IF EXISTS map_status_to_enum(TEXT);

-- Drop old tables in order (respecting foreign key constraints)
-- First drop dependent tables and functions
DROP FUNCTION IF EXISTS get_all_users_for_admin();

-- Drop dependent tables first
DROP TABLE IF EXISTS mktg_preferences;
DROP TABLE IF EXISTS parking_info;
DROP TABLE IF EXISTS profile;

-- Drop junction tables
DROP TABLE IF EXISTS user_diet_restrictions;
DROP TABLE IF EXISTS user_interests;

-- Drop main tables
DROP TABLE IF EXISTS workshop_registrations;
DROP TABLE IF EXISTS workshops;
DROP TABLE IF EXISTS users;

-- Drop lookup tables
DROP TABLE IF EXISTS dietary_restrictions;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS experience_types;
DROP TABLE IF EXISTS gender;
DROP TABLE IF EXISTS majors;
DROP TABLE IF EXISTS marketing_types;
DROP TABLE IF EXISTS universities;

-- Rename new users table to replace old one
ALTER TABLE users_new RENAME TO users;

-- Drop old enums that are no longer needed
DROP TYPE IF EXISTS parking_state;
DROP TYPE IF EXISTS status;
DROP TYPE IF EXISTS year_of_study;

-- Add RLS policies for new tables

-- Events table policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage events" ON events
    FOR ALL TO authenticated USING (true);

-- Event applications policies
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications" ON event_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" ON event_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON event_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

CREATE POLICY "Admins can update applications" ON event_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Application interests policies
ALTER TABLE application_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own application interests" ON application_interests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM event_applications 
            WHERE event_applications.id = application_interests.application_id 
            AND event_applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all application interests" ON application_interests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Application dietary restrictions policies
ALTER TABLE application_dietary_restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own application dietary restrictions" ON application_dietary_restrictions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM event_applications 
            WHERE event_applications.id = application_dietary_restrictions.application_id 
            AND event_applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all application dietary restrictions" ON application_dietary_restrictions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Event registrations policies
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events" ON event_registrations
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Check-ins policies
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins" ON checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins and volunteers can manage check-ins" ON checkins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Interest options policies
ALTER TABLE interest_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interest options are viewable by everyone" ON interest_options
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage interest options" ON interest_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Dietary restriction options policies
ALTER TABLE dietary_restriction_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dietary restriction options are viewable by everyone" ON dietary_restriction_options
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage dietary restriction options" ON dietary_restriction_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.user_type IN ('admin', 'volunteer')
            AND users.is_active = true
        )
    );

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users admin_user
            WHERE admin_user.id = auth.uid() 
            AND admin_user.user_type IN ('admin', 'volunteer')
            AND admin_user.is_active = true
        )
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users admin_user
            WHERE admin_user.id = auth.uid() 
            AND admin_user.user_type IN ('admin', 'volunteer')
            AND admin_user.is_active = true
        )
    );
