/*
  # Revoke public EXECUTE on handle_new_subscription

  The function handle_new_subscription() is a SECURITY DEFINER trigger function
  and should not be callable directly via the REST API by anon or authenticated roles.
  Trigger functions only need to be executable by the owner (postgres/service role).

  Changes:
  - Revoke EXECUTE on handle_new_subscription() from anon role
  - Revoke EXECUTE on handle_new_subscription() from authenticated role
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_subscription() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_subscription() FROM authenticated;
