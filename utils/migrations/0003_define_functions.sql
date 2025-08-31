-- Define all functions from remote schema

-- cleanup_expired_email_changes
CREATE OR REPLACE FUNCTION public.cleanup_expired_email_changes() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  -- Clean up expired email change requests in users table
  UPDATE public.users 
  SET 
    pending_email = NULL,
    email_change_requested_at = NULL
  WHERE 
    pending_email IS NOT NULL 
    AND email_change_requested_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Clean up expired email change requests in profile table
  UPDATE public.profile 
  SET 
    pending_email = NULL,
    email_change_requested_at = NULL
  WHERE 
    pending_email IS NOT NULL 
    AND email_change_requested_at < NOW() - INTERVAL '24 hours';
  
  RETURN cleanup_count;
END;
$$;

-- copy_user_to_profiles
CREATE OR REPLACE FUNCTION public.copy_user_to_profiles() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profile (id, email, f_name, l_name)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), SPLIT_PART(NEW.raw_user_meta_data ->> 'full_name', ' ', 2))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- delete_user_completely
CREATE OR REPLACE FUNCTION public.delete_user_completely() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Delete from profile table
  DELETE FROM public.profile WHERE id = current_user_id;
  
  -- Delete from users table
  DELETE FROM public.users WHERE id = current_user_id;
  
  -- Delete from auth.users table (this requires security definer)
  DELETE FROM auth.users WHERE id = current_user_id;
  
END;
$$;

-- get_all_users_for_admin
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin() RETURNS SETOF public.users
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return all users from public.users table
  RETURN QUERY
  SELECT * FROM users
  ORDER BY timestamp DESC NULLS LAST;
END;
$$;

-- is_admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.id = auth.uid() 
        AND admins.status = 'active'
    );
END;
$$;

-- is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid DEFAULT auth.uid()) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- This function runs with definer's rights (bypasses RLS)
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = user_id 
    AND role = 'super_admin'::admin_role 
    AND status = 'active'::admin_status
  );
END;
$$;

-- sync_confirmed_email
CREATE OR REPLACE FUNCTION public.sync_confirmed_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if email actually changed and is confirmed
  IF OLD.email != NEW.email AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Update public.users table
    UPDATE public.users 
    SET 
      email = NEW.email,
      pending_email = NULL,
      email_change_requested_at = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Update public.profile table
    UPDATE public.profile 
    SET 
      email = NEW.email,
      pending_email = NULL,
      email_change_requested_at = NULL,
      updated_at = NOW()
    WHERE id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- toggle_user_checkin_admin
CREATE OR REPLACE FUNCTION public.toggle_user_checkin_admin(user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Toggle check-in status
  UPDATE users 
  SET checked_in = NOT COALESCE(checked_in, FALSE)
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- update_user_status_admin
CREATE OR REPLACE FUNCTION public.update_user_status_admin(user_id uuid, new_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND status = 'active'::admin_status
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update user status
  UPDATE users 
  SET status = new_status
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- update_users_timestamp
CREATE OR REPLACE FUNCTION public.update_users_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.timestamp := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


