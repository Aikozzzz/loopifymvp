-- Allow validation triggers to lock rows without weakening participant RLS.
--
-- These trigger functions run during inserts made by non-owners. Their
-- FOR UPDATE queries must bypass the table's owner-only update policies while
-- auth.uid() must continue to represent the signed-in user.

create or replace function public.validate_donation_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item_status public.item_status;
  v_donor_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if new.requester_id <> auth.uid() then
    raise exception 'Requests must belong to the signed-in user';
  end if;

  if new.status <> 'pending' or new.donor_reply is not null then
    raise exception 'New requests must start pending without a donor reply';
  end if;

  select status, donor_id
  into v_item_status, v_donor_id
  from public.items
  where id = new.item_id
  for update;

  if not found then
    raise exception 'Donation not found';
  end if;

  if v_item_status <> 'available' then
    raise exception 'Donation is not available';
  end if;

  if v_donor_id = auth.uid() then
    raise exception 'Donors cannot request their own donations';
  end if;

  return new;
end;
$$;

create or replace function public.validate_event_participant()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event_status public.event_status;
  v_starts_at timestamptz;
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    raise exception 'Participants must belong to the signed-in user';
  end if;

  select status, starts_at
  into v_event_status, v_starts_at
  from public.events
  where id = new.event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  if v_event_status <> 'upcoming' or v_starts_at <= now() then
    raise exception 'Only upcoming events can be joined';
  end if;

  return new;
end;
$$;

-- These functions are intended to run only as table triggers, never as
-- browser-callable functions.
revoke execute on function public.validate_donation_request() from public, anon, authenticated;
revoke execute on function public.validate_event_participant() from public, anon, authenticated;
