-- Harden trigger and lifecycle functions without changing their intended
-- authorization rules.

-- Pin trigger search paths. These functions use only built-in functions and
-- trigger variables, so an empty path is safe and prevents object shadowing.
alter function public.set_updated_at()
  set search_path = '';

alter function public.validate_item_dates()
  set search_path = '';

alter function public.validate_event_schedule()
  set search_path = '';

alter function public.validate_donation_request()
  set search_path = '';

alter function public.validate_event_participant()
  set search_path = '';

alter function public.handle_new_user()
  set search_path = '';

alter function public.accept_donation_request(uuid, text)
  set search_path = '';

alter function public.decline_donation_request(uuid)
  set search_path = '';

alter function public.cancel_donation_request(uuid)
  set search_path = '';

alter function public.complete_donation(uuid)
  set search_path = '';

alter function public.withdraw_item(uuid)
  set search_path = '';

alter function public.complete_event(uuid)
  set search_path = '';

alter function public.cancel_event(uuid)
  set search_path = '';

-- Lifecycle functions are callable by the browser only for authenticated
-- users. Keep the authenticated grants used by the app, but remove anonymous
-- access explicitly rather than relying on PUBLIC privilege inheritance.
revoke execute on function public.accept_donation_request(uuid, text)
  from public, anon;

revoke execute on function public.decline_donation_request(uuid)
  from public, anon;

revoke execute on function public.cancel_donation_request(uuid)
  from public, anon;

revoke execute on function public.complete_donation(uuid)
  from public, anon;

revoke execute on function public.withdraw_item(uuid)
  from public, anon;

revoke execute on function public.complete_event(uuid)
  from public, anon;

revoke execute on function public.cancel_event(uuid)
  from public, anon;

grant execute on function public.accept_donation_request(uuid, text)
  to authenticated;

grant execute on function public.decline_donation_request(uuid)
  to authenticated;

grant execute on function public.cancel_donation_request(uuid)
  to authenticated;

grant execute on function public.complete_donation(uuid)
  to authenticated;

grant execute on function public.withdraw_item(uuid)
  to authenticated;

grant execute on function public.complete_event(uuid)
  to authenticated;

grant execute on function public.cancel_event(uuid)
  to authenticated;

-- A public bucket already allows direct object downloads without a SELECT
-- policy. Removing this broad policy prevents clients from listing every
-- object in the bucket while preserving public image URLs.
drop policy if exists "Anyone can view item images" on storage.objects;
