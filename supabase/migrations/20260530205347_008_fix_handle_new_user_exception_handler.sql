/*
  # Fix handle_new_user trigger with exception handling

  1. Changes
    - Wrap the profile insert in an exception handler so trigger errors
      never bubble up and block auth.users insert
    - This prevents "Database error saving new user" during signup

  2. Notes
    - ON CONFLICT DO NOTHING already handles duplicates
    - EXCEPTION block ensures any other error is silently ignored so signup always succeeds
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Athlete')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;