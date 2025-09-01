-- Fix column name mismatch with conditional check
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'year_of_study'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "year_of_study" TO "yearOfStudy";
  END IF;
END $$;