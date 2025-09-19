-- =============================================
-- LOOKUP TABLES (Reference Data)
-- =============================================

-- Dietary Restrictions
INSERT INTO "public"."dietary_restrictions" ("restriction") VALUES 
('None'),
('Vegetarian'), 
('Vegan'), 
('Gluten-free'), 
('Dairy-free'),
('Nut allergy'),
('Kosher'), 
('Halal'), 
('Peanuts and Treenuts allergy'),
('Shellfish allergy'),
('Other');

-- Experience Types
INSERT INTO "public"."experience_types" ("experience") VALUES 
('Beginner'), 
('Intermediate'), 
('Advanced'), 
('Expert');

-- Gender
INSERT INTO "public"."gender" ("gender") VALUES 
('Male'), 
('Female'), 
('Non-binary'), 
('Prefer not to say'),
('Other');

-- Interests
INSERT INTO "public"."interests" ("interest") VALUES 
('Mobile App Development'), 
('Web Development'), 
('Data Science and ML'), 
('Design and User Experience (UX/UI)'), 
('Game Development'),
('Cybersecurity'),
('Cloud Computing'),
('DevOps'),
('Blockchain'),
('AI/ML'),
('IoT'),
('AR/VR'),
('Backend Development'),
('Frontend Development'),
('Full Stack Development'),
('Database Design'),
('API Development'),
('Machine Learning'),
('Data Analytics'),
('UI/UX Design');

-- Majors
INSERT INTO "public"."majors" ("major") VALUES 
('Computer Science'),
('Computer Information Systems'),
('Software Engineering'),
('Data Science'),
('Data Analytics'),
('Mathematics'),
('Statistics'),
('Information Technology'),
('Cybersecurity'),
('Computer Engineering'),
('Electrical Engineering'),
('Mechanical Engineering'),
('Business Administration'),
('Accounting'),
('Finance'),
('Marketing'),
('Economics'),
('Physics'),
('Chemistry'),
('Biology'),
('Psychology'),
('Other');

-- Marketing Types
INSERT INTO "public"."marketing_types" ("marketing") VALUES 
('Social Media'), 
('University Website'), 
('Word of Mouth'), 
('Poster'), 
('Email'),
('Website/Googling it'), 
('Attended the event before'), 
('Student Organization'),
('Professor/Instructor'),
('Career Services'),
('Other');

-- Universities
INSERT INTO "public"."universities" ("uni") VALUES 
('Mount Royal University'),
('University of Calgary'),
('SAIT'),
('University of Alberta'),
('University of British Columbia'),
('University of Toronto'),
('University of Waterloo'),
('McGill University'),
('University of Saskatchewan'),
('University of Manitoba'),
('Dalhousie University'),
('Simon Fraser University'),
('York University'),
('Concordia University'),
('University of Ottawa'),
('Carleton University'),
('Athabasca University'),
('Bow Valley College'),
('Other');

-- =============================================
-- WORKSHOPS/EVENTS
-- =============================================

-- Workshops
INSERT INTO "public"."workshops" ("id", "title", "description", "event_name", "date", "start_time", "end_time", "location", "max_capacity", "is_active", "created_at", "updated_at") VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript to build your first website.', 'MRUHacks 2025', '2025-01-15', '09:00:00', '10:30:00', 'Room 101', 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Mobile App Development with React Native', 'Build cross-platform mobile applications using React Native.', 'MRUHacks 2025', '2025-01-15', '11:00:00', '12:30:00', 'Room 102', 25, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Data Science and Machine Learning', 'Introduction to data analysis and machine learning concepts.', 'MRUHacks 2025', '2025-01-15', '13:30:00', '15:00:00', 'Room 103', 20, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'UI/UX Design Workshop', 'Learn design principles and create user-friendly interfaces.', 'MRUHacks 2025', '2025-01-15', '15:30:00', '17:00:00', 'Room 104', 25, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Cloud Computing with AWS', 'Introduction to cloud services and deployment strategies.', 'MRUHacks 2025', '2025-01-16', '09:00:00', '10:30:00', 'Room 105', 20, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Cybersecurity Fundamentals', 'Learn about security best practices and common vulnerabilities.', 'MRUHacks 2025', '2025-01-16', '11:00:00', '12:30:00', 'Room 106', 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Blockchain and Cryptocurrency', 'Introduction to blockchain technology and its applications.', 'MRUHacks 2025', '2025-01-16', '13:30:00', '15:00:00', 'Room 107', 15, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'API Development and Integration', 'Learn how to build and consume RESTful APIs.', 'MRUHacks 2025', '2025-01-16', '15:30:00', '17:00:00', 'Room 108', 25, true, NOW(), NOW());


-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- 1. Insert 200 auth.users
-------------------------------------------------------
INSERT INTO "auth"."users" (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  role,
  aud
)
SELECT
  uuid_generate_v4(),
  'participant' || gs::text || '@student.mru.ca',
  '$2a$10$dummy.hash.for.testing.purposes.only', -- fake bcrypt hash
  NOW(),
  NOW(),
  NOW(),
  json_build_object(
    'first_name', 'First' || gs::text,
    'last_name', 'Last' || gs::text
  ),
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated'
FROM generate_series(1, 200) gs;

-------------------------------------------------------
-- 2. Insert into public.users
-------------------------------------------------------
INSERT INTO "public"."users" (
  id,
  f_name,
  l_name,
  gender,
  university,
  prev_attendance,
  major,
  parking,
  email,
  "yearOfStudy",
  experience,
  accommodations,
  marketing,
  "timestamp",
  status,
  checked_in,
  resume_url,
  resume_filename,
  updated_at
)
SELECT
  au.id,
  (au.raw_user_meta_data->>'first_name'),
  (au.raw_user_meta_data->>'last_name'),
  (random() * ((SELECT COUNT(*) FROM public.gender) - 1) + 1)::int,
  (random() * ((SELECT COUNT(*) FROM public.universities) - 1) + 1)::int,
  (random() > 0.5),
  (random() * ((SELECT COUNT(*) FROM public.majors) - 1) + 1)::int,
  (ARRAY['Yes','No','Not sure'])[floor(random()*3+1)]::parking_state,
  au.email,
  (ARRAY['1st','2nd','3rd','4th+','Recent Grad'])[floor(random()*5+1)]::year_of_study,
  (random() * ((SELECT COUNT(*) FROM public.experience_types) - 1) + 1)::int,
  'None',
  (random() * ((SELECT COUNT(*) FROM public.marketing_types) - 1) + 1)::int,
  NOW(),
  (ARRAY['confirmed','pending','waitlisted'])[floor(random()*3+1)]::status,
  (random() > 0.7),
  'https://example.com/resumes/' || lower(au.raw_user_meta_data->>'first_name') || '_' || lower(au.raw_user_meta_data->>'last_name') || '.pdf',
  lower(au.raw_user_meta_data->>'first_name') || '_' || lower(au.raw_user_meta_data->>'last_name') || '_resume.pdf',
  NOW()
FROM auth.users au
WHERE au.email LIKE 'participant%';

-------------------------------------------------------
-- Marketing Preferences
-- Each participant gets a record with random send_emails flag
-------------------------------------------------------
INSERT INTO "public"."mktg_preferences" ("id", "send_emails")
SELECT
  u.id,
  (random() > 0.3) -- ~70% of users agree to emails
FROM public.users u
WHERE u.email LIKE 'participant%';

-------------------------------------------------------
-- Parking Info
-- Only for participants who answered "Yes" for parking
-------------------------------------------------------
INSERT INTO "public"."parking_info" ("id", "license_plate")
SELECT
  u.id,
  'ABC' || floor(random() * 900 + 100)::text  -- fake plate like ABC123
FROM public.users u
WHERE u.email LIKE 'participant%'
  AND u.parking = 'Yes';


-------------------------------------------------------
-- User Interests
-- Each participant gets 1–3 random interests (no duplicates)
-------------------------------------------------------
-- First interest (everyone gets at least one)
INSERT INTO "public"."user_interests" ("id", "interest")
SELECT
  u.id,
  (random() * ((SELECT COUNT(*) FROM public.interests) - 1) + 1)::int
FROM public.users u
WHERE u.email LIKE 'participant%';

-- Optional 2nd interest (~50% of users) - only if they don't already have this interest
INSERT INTO "public"."user_interests" ("id", "interest")
WITH available_interests AS (
  SELECT 
    u.id,
    i.id as interest_id,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY random()) as rn
  FROM public.users u
  CROSS JOIN public.interests i
  WHERE u.email LIKE 'participant%'
    AND random() > 0.5
    AND NOT EXISTS (
      SELECT 1 FROM public.user_interests ui 
      WHERE ui.id = u.id AND ui.interest = i.id
    )
)
SELECT id, interest_id
FROM available_interests
WHERE rn = 1;

-- Optional 3rd interest (~25% of users) - only if they don't already have this interest
INSERT INTO "public"."user_interests" ("id", "interest")
WITH available_interests AS (
  SELECT 
    u.id,
    i.id as interest_id,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY random()) as rn
  FROM public.users u
  CROSS JOIN public.interests i
  WHERE u.email LIKE 'participant%'
    AND random() > 0.75
    AND NOT EXISTS (
      SELECT 1 FROM public.user_interests ui 
      WHERE ui.id = u.id AND ui.interest = i.id
    )
)
SELECT id, interest_id
FROM available_interests
WHERE rn = 1;


-------------------------------------------------------
-- User Dietary Restrictions
-- Most participants have none, but some get 1–2 restrictions (no duplicates)
-------------------------------------------------------

-- First restriction (~30% of users)
INSERT INTO "public"."user_diet_restrictions" ("id", "restriction")
SELECT
  u.id,
  (random() * ((SELECT COUNT(*) FROM public.dietary_restrictions) - 1) + 1)::int
FROM public.users u
WHERE u.email LIKE 'participant%'
  AND random() < 0.3;

-- Optional second restriction (~10% of users) - only if they don't already have this restriction
INSERT INTO "public"."user_diet_restrictions" ("id", "restriction")
WITH available_restrictions AS (
  SELECT 
    u.id,
    dr.id as restriction_id,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY random()) as rn
  FROM public.users u
  CROSS JOIN public.dietary_restrictions dr
  WHERE u.email LIKE 'participant%'
    AND random() < 0.1
    AND NOT EXISTS (
      SELECT 1 FROM public.user_diet_restrictions udr 
      WHERE udr.id = u.id AND udr.restriction = dr.id
    )
)
SELECT id, restriction_id
FROM available_restrictions
WHERE rn = 1;



-------------------------------------------------------
-- Workshop Registrations
-- Each participant may register for 0–3 random workshops (no duplicates)
-------------------------------------------------------

-- First registration (~70% of users)
INSERT INTO "public"."workshop_registrations" 
("id", "user_id", "workshop_id", "registered_at", "f_name", "l_name", "yearOfStudy", "gender", "major")
SELECT
  uuid_generate_v4(),
  u.id,
  (SELECT id FROM public.workshops ORDER BY random() LIMIT 1),
  NOW(),
  u.f_name,
  u.l_name,
  u."yearOfStudy",
  u.gender,
  u.major
FROM public.users u
WHERE u.email LIKE 'participant%'
  AND random() < 0.7
ON CONFLICT (user_id, workshop_id) DO NOTHING;

-- Optional second registration (~30% of users) - only if they don't already have this workshop
INSERT INTO "public"."workshop_registrations" 
("id", "user_id", "workshop_id", "registered_at", "f_name", "l_name", "yearOfStudy", "gender", "major")
WITH available_workshops AS (
  SELECT 
    u.id,
    w.id as workshop_id,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY random()) as rn
  FROM public.users u
  CROSS JOIN public.workshops w
  WHERE u.email LIKE 'participant%'
    AND random() < 0.3
    AND NOT EXISTS (
      SELECT 1 FROM public.workshop_registrations wr 
      WHERE wr.user_id = u.id AND wr.workshop_id = w.id
    )
)
SELECT 
  uuid_generate_v4(),
  u.id,
  aw.workshop_id,
  NOW(),
  u.f_name,
  u.l_name,
  u."yearOfStudy",
  u.gender,
  u.major
FROM available_workshops aw
JOIN public.users u ON aw.id = u.id
WHERE aw.rn = 1
ON CONFLICT (user_id, workshop_id) DO NOTHING;

-- Optional third registration (~10% of users) - only if they don't already have this workshop
INSERT INTO "public"."workshop_registrations" 
("id", "user_id", "workshop_id", "registered_at", "f_name", "l_name", "yearOfStudy", "gender", "major")
WITH available_workshops AS (
  SELECT 
    u.id,
    w.id as workshop_id,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY random()) as rn
  FROM public.users u
  CROSS JOIN public.workshops w
  WHERE u.email LIKE 'participant%'
    AND random() < 0.1
    AND NOT EXISTS (
      SELECT 1 FROM public.workshop_registrations wr 
      WHERE wr.user_id = u.id AND wr.workshop_id = w.id
    )
)
SELECT 
  uuid_generate_v4(),
  u.id,
  aw.workshop_id,
  NOW(),
  u.f_name,
  u.l_name,
  u."yearOfStudy",
  u.gender,
  u.major
FROM available_workshops aw
JOIN public.users u ON aw.id = u.id
WHERE aw.rn = 1
ON CONFLICT (user_id, workshop_id) DO NOTHING;