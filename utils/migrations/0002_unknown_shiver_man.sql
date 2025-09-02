ALTER TABLE "users" ALTER COLUMN "timestamp" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "timestamp" SET NOT NULL;

-- Seed dietary_restrictions
INSERT INTO dietary_restrictions (restriction) VALUES
  ('Kosher'),
  ('Vegetarian'),
  ('Vegan'),
  ('Halal'),
  ('Gluten-free'),
  ('Peanuts & Treenuts allergy'),
  ('None')
ON CONFLICT DO NOTHING;

-- Seed interests
INSERT INTO interests (interest) VALUES
  ('Mobile App Development'),
  ('Web Development'),
  ('Data Science and ML'),
  ('Design and User Experience (UX/UI)'),
  ('Game Development')
ON CONFLICT DO NOTHING;

-- Seed marketing_types
INSERT INTO marketing_types (marketing) VALUES
  ('Poster'),
  ('Social Media'),
  ('Word of Mouth'),
  ('Website / Googling it'),
  ('Attended the event before'),
  ('Other…')
ON CONFLICT DO NOTHING;
