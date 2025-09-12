-- Phase 4: Create Performance Indexes
-- This migration creates all the performance indexes for the new schema

-- Users table indexes
CREATE INDEX idx_users_id ON users_new(id);
CREATE INDEX idx_users_email ON users_new(email);
CREATE INDEX idx_users_type ON users_new(user_type);
CREATE INDEX idx_users_active ON users_new(is_active);

-- Events table indexes
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_requires_app ON events(requires_application);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Applications table indexes
CREATE INDEX idx_applications_event ON event_applications(event_id);
CREATE INDEX idx_applications_user ON event_applications(user_id);
CREATE INDEX idx_applications_status ON event_applications(status);
CREATE INDEX idx_applications_reviewed_by ON event_applications(reviewed_by);
CREATE INDEX idx_applications_created_at ON event_applications(created_at);

-- Junction table indexes
CREATE INDEX idx_app_interests_interest ON application_interests(interest_id);
CREATE INDEX idx_app_dietary_restriction ON application_dietary_restrictions(restriction_id);

-- Event registrations indexes
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_active ON event_registrations(is_active);

-- Check-ins table indexes
CREATE INDEX idx_checkins_event ON checkins(event_id);
CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_time ON checkins(checkin_time);
CREATE INDEX idx_checkins_checked_by ON checkins(checked_in_by);

-- Lookup table indexes
CREATE INDEX idx_interest_options_active ON interest_options(is_active);
CREATE INDEX idx_interest_options_sort ON interest_options(sort_order);
CREATE INDEX idx_dietary_restriction_options_active ON dietary_restriction_options(is_active);
CREATE INDEX idx_dietary_restriction_options_sort ON dietary_restriction_options(sort_order);
