/*
  # Revoke PUBLIC EXECUTE on handle_new_subscription

  The previous migration revoked from anon and authenticated roles, but the
  function still had EXECUTE granted to the PUBLIC pseudo-role, which covers
  all roles including anon and authenticated.

  This migration revokes EXECUTE from PUBLIC, leaving only postgres and
  service_role able to call the function. The trigger itself is unaffected.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_subscription() FROM PUBLIC;
