-- Removes Joe's admin login. Run by hand in the Supabase SQL editor.
--
-- Admin access is "any authenticated user" (see the RLS policies in
-- schema.sql), so deleting the auth user is what revokes his access. No
-- league table references auth.users, so this touches no league data.
--
-- Kept out of supabase/migrations/ on purpose: it targets one person in the
-- production database and must never replay against a fresh one.

-- STEP 1: find his account. Confirm the email before running step 2.
select id, email, created_at, last_sign_in_at
from auth.users
order by created_at;

-- STEP 2: replace the email below with the one from step 1, then run.
-- Aborts unless exactly one account matches, so a typo deletes nothing.
do $$
declare
  target_email text := 'JOE_EMAIL_HERE';
  matched int;
begin
  select count(*) into matched from auth.users where lower(email) = lower(target_email);
  if matched <> 1 then
    raise exception 'Expected exactly 1 user for %, found %. Nothing deleted.', target_email, matched;
  end if;

  -- Sessions, refresh tokens and identities cascade from auth.users, so any
  -- browser he is still signed in on loses access on its next token refresh.
  delete from auth.users where lower(email) = lower(target_email);
  raise notice 'Deleted admin user %', target_email;
end $$;

-- STEP 3: confirm he is gone.
select id, email from auth.users order by created_at;
