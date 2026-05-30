/*
  # Change to AFTER trigger for better compatibility

  1. Changes
    - Change trigger from BEFORE to AFTER INSERT
    - This ensures the user is fully created before we try to create the profile
  
  2. Important Notes
    - AFTER triggers run after the row is committed, avoiding potential conflicts
    - This works better with email verification enabled
*/

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate as AFTER trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();