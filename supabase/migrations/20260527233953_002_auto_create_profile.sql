/*
  # Add automatic profile creation trigger

  1. Changes
    - Create a function that automatically creates a profile when a new user signs up
    - Add a trigger that calls this function after insert on auth.users
    - This ensures the profile exists before the user tries to create workout types

  2. Important Notes
    - Uses `SECURITY DEFINER` to run with elevated privileges
    - Uses `BEFORE INSERT` trigger to ensure profile exists immediately
    - Works with Supabase's built-in auth system
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Athlete')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call the function before insert on auth.users
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();