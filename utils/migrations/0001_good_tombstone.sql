ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resume" text;

-- Seed dietary_restrictions
INSERT INTO dietary_restrictions (restriction) VALUES
  ('Kosher'),
  ('Vegetarian'),
  ('Vegan'),
  ('Halal'),
  ('Gluten-free'),
  ('Peanuts and Treenuts allergy')
ON CONFLICT DO NOTHING;

-- Seed interests
INSERT INTO interests (interest) VALUES
  ('Mobile App Development'),
  ('Web Development'),
  ('Data Science and ML'),
  ('Design and User Experience (UX/UI)'),
  ('Game Development')
ON CONFLICT DO NOTHING;

-- Seed universities (full list)
INSERT INTO universities (uni) VALUES
  ('Mount Royal University'),
  ('University of Calgary'),
  ('SAIT Polytechnic'),
  ('Ambrose University'),
  ('Bow Valley College'),
  ('St. Mary''s University'),
  ('University of Alberta'),
  ('University of British Columbia'),
  ('Simon Fraser University'),
  ('McGill University'),
  ('University of Toronto'),
  ('York University'),
  ('Ryerson University'),
  ('University of Waterloo'),
  ('McMaster University'),
  ('Queen''s University'),
  ('Carleton University'),
  ('University of Ottawa'),
  ('Concordia University'),
  ('University of Manitoba'),
  ('University of Saskatchewan'),
  ('University of Regina'),
  ('Memorial University of Newfoundland'),
  ('Dalhousie University'),
  ('University of New Brunswick'),
  ('University of Prince Edward Island'),
  ('Acadia University')
ON CONFLICT DO NOTHING;

-- Seed majors (full list)
INSERT INTO majors (major) VALUES
  ('Bachelor of Arts – Policy Studies'),
  ('Bachelor of Computer Information Systems'),
  ('Bachelor of Science – Biology'),
  ('Bachelor of Science – Chemistry'),
  ('Bachelor of Science – Computer Science'),
  ('Bachelor of Science – Data Science')
ON CONFLICT DO NOTHING;

-- Seed marketing_types
INSERT INTO marketing_types (marketing) VALUES
  ('Poster'),
  ('Social Media'),
  ('Word of Mouth'),
  ('Website/Googling it'),
  ('Attended the event before')
ON CONFLICT DO NOTHING;

-- Seed experience_types
INSERT INTO experience_types (experience) VALUES
  ('Beginner'),
  ('Intermediate'),
  ('Advanced'),
  ('Expert')
ON CONFLICT DO NOTHING;

-- Seed gender
INSERT INTO gender (gender) VALUES
  ('Male'),
  ('Female'),
  ('Other'),
  ('Prefer not to say')
ON CONFLICT DO NOTHING;
