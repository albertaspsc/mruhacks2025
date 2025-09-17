-- Define trigger functions and triggers mirrored from remote schema
-- Functions

CREATE OR REPLACE FUNCTION public.update_users_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.timestamp := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers

CREATE OR REPLACE TRIGGER set_users_timestamp
BEFORE INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_users_timestamp();

CREATE OR REPLACE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


