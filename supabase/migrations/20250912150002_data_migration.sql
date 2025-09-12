-- Phase 2: Data Migration with Mapping Functions
-- This migration migrates all existing data to the new schema

-- Create mapping functions based on actual seed data

-- Gender mapping function
CREATE OR REPLACE FUNCTION map_gender_to_enum(gender_text TEXT)
RETURNS gender_enum AS $$
BEGIN
    RETURN CASE gender_text
        WHEN 'Male' THEN 'male'::gender_enum
        WHEN 'Female' THEN 'female'::gender_enum
        WHEN 'Non-binary' THEN 'non-binary'::gender_enum
        WHEN 'Prefer not to say' THEN 'prefer-not-to-say'::gender_enum
        ELSE 'other'::gender_enum
    END;
END;
$$ LANGUAGE plpgsql;

-- Year of study mapping function
CREATE OR REPLACE FUNCTION map_year_of_study_to_enum(year_text TEXT)
RETURNS year_of_study_enum AS $$
BEGIN
    RETURN CASE year_text
        WHEN '1st' THEN 'first'::year_of_study_enum
        WHEN '2nd' THEN 'second'::year_of_study_enum
        WHEN '3rd' THEN 'third'::year_of_study_enum
        WHEN '4th+' THEN 'fourth'::year_of_study_enum
        WHEN 'Recent Grad' THEN 'graduate'::year_of_study_enum
        ELSE 'other'::year_of_study_enum
    END;
END;
$$ LANGUAGE plpgsql;

-- Programming experience mapping function
CREATE OR REPLACE FUNCTION map_experience_to_enum(experience_text TEXT)
RETURNS programming_experience_enum AS $$
BEGIN
    RETURN CASE experience_text
        WHEN 'Beginner' THEN 'beginner'::programming_experience_enum
        WHEN 'Intermediate' THEN 'intermediate'::programming_experience_enum
        WHEN 'Advanced' THEN 'advanced'::programming_experience_enum
        WHEN 'Expert' THEN 'expert'::programming_experience_enum
        ELSE 'beginner'::programming_experience_enum
    END;
END;
$$ LANGUAGE plpgsql;

-- Marketing/How did you hear mapping function
CREATE OR REPLACE FUNCTION map_marketing_to_enum(marketing_text TEXT)
RETURNS how_did_you_hear_enum AS $$
BEGIN
    RETURN CASE marketing_text
        WHEN 'Social Media' THEN 'social-media'::how_did_you_hear_enum
        WHEN 'Word of Mouth' THEN 'friend'::how_did_you_hear_enum
        WHEN 'Website/Googling it' THEN 'website'::how_did_you_hear_enum
        WHEN 'Attended the event before' THEN 'university'::how_did_you_hear_enum
        WHEN 'Poster' THEN 'university'::how_did_you_hear_enum
        WHEN 'Other' THEN 'other'::how_did_you_hear_enum
        ELSE 'other'::how_did_you_hear_enum
    END;
END;
$$ LANGUAGE plpgsql;

-- Application status mapping function
CREATE OR REPLACE FUNCTION map_status_to_enum(status_text TEXT)
RETURNS application_status_enum AS $$
BEGIN
    RETURN CASE status_text
        WHEN 'confirmed' THEN 'approved'::application_status_enum
        WHEN 'pending' THEN 'pending'::application_status_enum
        WHEN 'waitlisted' THEN 'pending'::application_status_enum
        WHEN 'rejected' THEN 'rejected'::application_status_enum
        ELSE 'pending'::application_status_enum
    END;
END;
$$ LANGUAGE plpgsql;

-- Migrate lookup tables
INSERT INTO interest_options (interest_name, is_active, sort_order)
SELECT interest, true, id FROM interests;

INSERT INTO dietary_restriction_options (restriction_name, is_active, sort_order)
SELECT restriction, true, id FROM dietary_restrictions;

-- Create main event to represent the current hackathon (only if it doesn't exist)
INSERT INTO events (
    event_name, description, event_date, start_time, end_time,
    location, max_capacity, requires_application, is_active,
    created_at, updated_at
)
SELECT 
    'MRUHacks 2025',
    'Annual hackathon event at Mount Royal University',
    '2025-01-01', -- Update with actual event date
    '09:00:00',   -- Update with actual start time
    '18:00:00',   -- Update with actual end time
    'Mount Royal University',
    150, -- Update with actual capacity
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM events WHERE event_name = 'MRUHacks 2025'
);

-- Migrate workshops to events (excluding the main event we just created)
-- Note: We'll let the events table auto-generate IDs and just copy the data
INSERT INTO events (
    event_name, description, event_date, start_time, end_time,
    location, max_capacity, requires_application, is_active,
    created_at, updated_at
)
SELECT
    title,
    description,
    date,
    start_time,
    end_time,
    location,
    max_capacity,
    false, -- workshops don't require application
    is_active,
    created_at,
    updated_at
FROM workshops;

-- Migrate users to event_applications using mapping functions
INSERT INTO event_applications (
    event_id, user_id, first_name, last_name, has_attended_before,
    gender, university_id, major_id, year_of_study, programming_experience,
    special_accommodations, requires_parking, how_did_you_hear,
    resume_file_path, status, created_at, updated_at
)
SELECT
    -- select the main event id (get the first one if multiple exist)
    (SELECT id FROM events WHERE event_name = 'MRUHacks 2025' ORDER BY created_at LIMIT 1),
    u.id, -- user_id
    u.f_name,
    u.l_name,
    u.prev_attendance,
    -- Use mapping functions for cleaner code
    map_gender_to_enum(g.gender),
    un.uni, -- University name
    m.major, -- Major name
    map_year_of_study_to_enum(u."yearOfStudy"::text),
    map_experience_to_enum(et.experience),
    u.accommodations,
    CASE u.parking
        WHEN 'Yes' THEN true
        WHEN 'No' THEN false
        ELSE false
    END,
    map_marketing_to_enum(mt.marketing),
    u.resume_url,
    map_status_to_enum(u.status::text),
    u.timestamp,
    u.updated_at
FROM users u
LEFT JOIN gender g ON u.gender = g.id
LEFT JOIN universities un ON u.university = un.id
LEFT JOIN majors m ON u.major = m.id
LEFT JOIN experience_types et ON u.experience = et.id
LEFT JOIN marketing_types mt ON u.marketing = mt.id;

-- Migrate user_interests to application_interests
INSERT INTO application_interests (application_id, interest_id)
SELECT
    ea.id,
    io.id
FROM user_interests ui
JOIN event_applications ea ON ui.id = ea.user_id
JOIN interest_options io ON ui.interest = io.id;

-- Migrate user_diet_restrictions to application_dietary_restrictions
INSERT INTO application_dietary_restrictions (application_id, restriction_id)
SELECT
    ea.id,
    dro.id
FROM user_diet_restrictions udr
JOIN event_applications ea ON udr.id = ea.user_id
JOIN dietary_restriction_options dro ON udr.restriction = dro.id;

-- Migrate workshop_registrations to event_registrations
-- We need to map workshop UUIDs to the new event IDs based on matching titles
INSERT INTO event_registrations (event_id, user_id, registered_at, is_active)
SELECT
    e.id as event_id,
    wr.user_id,
    wr.registered_at,
    true
FROM workshop_registrations wr
JOIN workshops w ON wr.workshop_id = w.id
JOIN events e ON w.title = e.event_name
WHERE e.event_name != 'MRUHacks 2025'; -- Exclude the main event, only migrate workshops

-- Migrate from current users table to new users table
INSERT INTO users_new (id, email, user_type, created_at, updated_at, is_active)
SELECT
    id,
    email,
    'participant'::user_type,
    COALESCE(timestamp, NOW()),
    updated_at,
    true
FROM users;

-- Add admins to new users table
INSERT INTO users_new (id, email, user_type, created_at, updated_at, is_active)
SELECT
    id,
    email,
    CASE
        WHEN role = 'super_admin' THEN 'admin'::user_type
        WHEN role = 'volunteer' THEN 'volunteer'::user_type
        ELSE 'admin'::user_type
    END,
    created_at,
    updated_at,
    CASE WHEN status = 'active' THEN true ELSE false END
FROM admins;
