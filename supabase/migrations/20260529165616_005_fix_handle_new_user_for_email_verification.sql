/*
  # Fix handle_new_user for email verification

  1. Changes
    - Update handle_new_user function to bypass RLS explicitly
    - Ensure the function works during signup with email verification enabled
  
  2. Important Notes
    - SECURITY DEFINER functions should bypass RLS, but we need to ensure proper permissions
    - The function needs to work when triggered by auth.users insert, even for unconfirmed users
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with SECURITY DEFINER privileges
  -- This bypasses RLS since the function runs as the table owner
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Athlete')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;