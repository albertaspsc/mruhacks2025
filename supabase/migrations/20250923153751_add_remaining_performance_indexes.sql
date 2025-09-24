-- Add remaining performance indexes to address database linter warnings
-- This migration adds foreign key indexes and primary keys to improve query performance

-- Foreign key indexes for better join performance on junction tables
CREATE INDEX idx_user_interests_interest_id ON user_interests(interest);
CREATE INDEX idx_user_diet_restrictions_restriction_id ON user_diet_restrictions(restriction);

-- Add primary keys to junction tables for better performance
-- Note: These tables currently don't have primary keys, which can impact performance
-- We'll add composite primary keys since these are many-to-many relationship tables
ALTER TABLE user_interests ADD CONSTRAINT user_interests_pkey PRIMARY KEY (id, interest);
ALTER TABLE user_diet_restrictions ADD CONSTRAINT user_diet_restrictions_pkey PRIMARY KEY (id, restriction);

-- Add indexes for foreign key columns in users table to improve lookup performance
CREATE INDEX idx_users_experience ON users(experience);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_major ON users(major);
CREATE INDEX idx_users_marketing ON users(marketing);
CREATE INDEX idx_users_university ON users(university);
