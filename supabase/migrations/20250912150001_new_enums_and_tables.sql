-- Phase 1: Create New Enums and Tables
-- This migration creates the new enums and tables for the event management system

-- Create new enums
CREATE TYPE user_type AS ENUM ('participant', 'admin', 'volunteer');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'non-binary', 'prefer-not-to-say', 'other');
CREATE TYPE year_of_study_enum AS ENUM ('first', 'second', 'third', 'fourth', 'fifth-plus', 'graduate', 'other');
CREATE TYPE programming_experience_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE how_did_you_hear_enum AS ENUM ('social-media', 'university', 'friend', 'website', 'other');
CREATE TYPE application_status_enum AS ENUM ('pending', 'approved', 'rejected');

-- Create events table (renamed from workshops)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    max_capacity INT,
    requires_application BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Create interest options lookup table (renamed from interests)
CREATE TABLE interest_options (
    id SERIAL PRIMARY KEY,
    interest_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- Create dietary restriction options lookup table (renamed from dietary_restrictions)
CREATE TABLE dietary_restriction_options (
    id SERIAL PRIMARY KEY,
    restriction_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- Create event applications table (new structure based on users table)
CREATE TABLE event_applications (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    user_id UUID NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    has_attended_before BOOLEAN NOT NULL,
    gender gender_enum NOT NULL,
    
    -- Academic Information
    university_id VARCHAR(255) NOT NULL,
    major_id VARCHAR(255) NOT NULL,
    year_of_study year_of_study_enum NOT NULL,
    programming_experience programming_experience_enum NOT NULL,
    
    -- Event Details
    special_accommodations TEXT,
    requires_parking BOOLEAN NOT NULL,
    how_did_you_hear how_did_you_hear_enum NOT NULL,
    resume_file_path VARCHAR(500),
    
    -- Application Status
    status application_status_enum DEFAULT 'pending',
    reviewed_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);

-- Create application interests junction table (renamed from user_interests)
CREATE TABLE application_interests (
    application_id INT NOT NULL,
    interest_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (application_id, interest_id),
    FOREIGN KEY (application_id) REFERENCES event_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interest_options(id)
);

-- Create application dietary restrictions junction table (renamed from user_diet_restrictions)
CREATE TABLE application_dietary_restrictions (
    application_id INT NOT NULL,
    restriction_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (application_id, restriction_id),
    FOREIGN KEY (application_id) REFERENCES event_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction_options(id)
);

-- Create event registrations table (renamed from workshop_registrations)
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    user_id UUID NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    UNIQUE (event_id, user_id)
);

-- Create check-ins table (new)
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    user_id UUID NOT NULL,
    checked_in_by UUID NOT NULL,
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (checked_in_by) REFERENCES auth.users(id),
    UNIQUE (event_id, user_id)
);

-- Create new users table with simplified structure
CREATE TABLE users_new (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type user_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_applications_updated_at BEFORE UPDATE ON event_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_new_updated_at BEFORE UPDATE ON users_new FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
