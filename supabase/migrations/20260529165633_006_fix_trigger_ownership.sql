/*
  # Fix trigger and function ownership for email verification

  1. Changes
    - Ensure handle_new_user function is owned by postgres
    - Recreate trigger with proper ownership
  
  2. Important Notes
    - The function needs to run with postgres privileges to bypass RLS
    - Trigger must be owned by postgres to execute properly during auth signup
*/

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ensure the function is owned by postgres and has correct permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();