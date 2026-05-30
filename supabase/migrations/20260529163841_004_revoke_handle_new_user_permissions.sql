/*
  # Revoke execute permissions on handle_new_user function

  1. Security Changes
    - Revoke EXECUTE permission from anon role on handle_new_user function
    - Revoke EXECUTE permission from authenticated role on handle_new_user function
  
  2. Important Notes
    - This function is triggered internally by the auth.users INSERT trigger
    - It should NOT be directly executable via REST API by any user
    - The function still runs automatically when new users are created via the trigger
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;