-- Loopify MVP database foundation.
-- Public listing data lives on items/events. Private pickup instructions live
-- in donation_requests.donor_reply and are visible only to the donor and the
-- accepted requester through the request RLS policy.

create extension if not exists pgcrypto;

create type public.item_category as enum (
  'clothes',
  'books',
  'electronics',
  'furniture',
  'sealed_food',
  'household',
  'other'
);

create type public.item_condition as enum (
  'new',
  'like_new',
  'good',
  'fair'
);

create type public.item_status as enum (
  'available',
  'reserved',
  'completed',
  'withdrawn'
);

create type public.request_status as enum (
  'pending',
  'accepted',
  'declined',
  'cancelled',
  'fulfilled'
);

create type public.event_type as enum (
  'cleanup',
  'food_drive',
  'clothing_drive',
  'recycling',
  'other'
);

create type public.event_status as enum (
  'upcoming',
  'completed',
  'cancelled'
);

create type public.report_target_type as enum (
  'item',
  'event',
  'user'
);

create type public.report_reason as enum (
  'prohibited_item',
  'unsafe_behavior',
  'harassment',
  'spam',
  'other'
);

create type public.report_status as enum (
  'pending',
  'reviewed',
  'dismissed',
  'action_taken'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null
    check (char_length(btrim(display_name)) between 2 and 60),
  township text
    check (township is null or char_length(btrim(township)) between 2 and 80),
  avatar_url text
    check (avatar_url is null or char_length(avatar_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null
    check (char_length(btrim(title)) between 3 and 100),
  description text not null
    check (char_length(btrim(description)) between 10 and 1500),
  category public.item_category not null,
  condition public.item_condition not null,
  status public.item_status not null default 'available',
  township text not null
    check (char_length(btrim(township)) between 2 and 80),
  image_path text not null
    check (char_length(image_path) between 77 and 512),
  food_expiration_date date,
  pickup_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint item_image_path_is_owner_uuid check (
    image_path ~* (
      '^' || donor_id::text ||
      E'/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|jpeg|png|webp)$'
    )
  ),
  constraint sealed_food_requires_dates check (
    category <> 'sealed_food'
    or (food_expiration_date is not null and pickup_deadline is not null)
  ),
  constraint non_food_cannot_have_food_dates check (
    category = 'sealed_food'
    or (food_expiration_date is null and pickup_deadline is null)
  )
);

create table public.donation_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  request_message text not null
    check (char_length(btrim(request_message)) between 10 and 500),
  status public.request_status not null default 'pending',
  -- This is the donor's private pickup/contact note. It is populated only
  -- when a request is accepted and is never part of an item listing.
  donor_reply text
    check (donor_reply is null or char_length(btrim(donor_reply)) between 1 and 500),
  constraint donor_reply_only_after_acceptance check (
    donor_reply is null
    or status in ('accepted', 'fulfilled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, requester_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null
    check (char_length(btrim(title)) between 3 and 120),
  description text not null
    check (char_length(btrim(description)) between 10 and 2000),
  event_type public.event_type not null,
  location_name text not null
    check (char_length(btrim(location_name)) between 2 and 150),
  township text not null
    check (char_length(btrim(township)) between 2 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.event_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_event_time check (
    ends_at is null or ends_at > starts_at
  )
);

create table public.event_participants (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  item_id uuid references public.items(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason public.report_reason not null,
  details text
    check (details is null or char_length(btrim(details)) between 1 and 1000),
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint report_has_exactly_one_target check (
    (target_type = 'item'
      and item_id is not null
      and event_id is null
      and reported_user_id is null)
    or (target_type = 'event'
      and item_id is null
      and event_id is not null
      and reported_user_id is null)
    or (target_type = 'user'
      and item_id is null
      and event_id is null
      and reported_user_id is not null)
  )
);

create index profiles_township_index
  on public.profiles (township);

create index items_feed_index
  on public.items (status, created_at desc);

create index items_category_feed_index
  on public.items (status, category, created_at desc);

create index items_township_feed_index
  on public.items (status, township, created_at desc);

create index items_donor_index
  on public.items (donor_id, status, created_at desc);

create index donation_requests_item_status_index
  on public.donation_requests (item_id, status, created_at);

create index donation_requests_requester_index
  on public.donation_requests (requester_id, status, created_at desc);

create index events_feed_index
  on public.events (status, starts_at);

create index events_township_feed_index
  on public.events (status, township, starts_at);

create index events_creator_index
  on public.events (creator_id, status, starts_at desc);

create index event_participants_user_index
  on public.event_participants (user_id, joined_at desc);

create index reports_target_index
  on public.reports (target_type, created_at desc);

create index reports_reporter_index
  on public.reports (reporter_id, created_at desc);

create unique index reports_one_item_per_reporter_index
  on public.reports (reporter_id, item_id)
  where item_id is not null;

create unique index reports_one_event_per_reporter_index
  on public.reports (reporter_id, event_id)
  where event_id is not null;

create unique index reports_one_user_per_reporter_index
  on public.reports (reporter_id, reported_user_id)
  where reported_user_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create trigger donation_requests_set_updated_at
before update on public.donation_requests
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.validate_item_dates()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.category is not distinct from old.category
      and new.food_expiration_date is not distinct from old.food_expiration_date
      and new.pickup_deadline is not distinct from old.pickup_deadline
    then
      return new;
    end if;
  end if;

  if new.category = 'sealed_food' then
    if new.food_expiration_date is null
      or new.food_expiration_date <= current_date
    then
      raise exception 'Sealed food must have a future expiration date';
    end if;

    if new.pickup_deadline is null or new.pickup_deadline <= now() then
      raise exception 'Sealed food must have a future pickup deadline';
    end if;
  elsif new.food_expiration_date is not null
    or new.pickup_deadline is not null
  then
    raise exception 'Food dates are only valid for sealed food';
  end if;

  return new;
end;
$$;

create trigger items_validate_dates
before insert or update on public.items
for each row execute function public.validate_item_dates();

create or replace function public.validate_event_schedule()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.starts_at <= now() then
      raise exception 'Events must start in the future';
    end if;
  elsif new.starts_at is distinct from old.starts_at then
    if new.starts_at <= now() then
      raise exception 'Events must start in the future';
    end if;
  end if;

  if new.ends_at is not null and new.ends_at <= new.starts_at then
    raise exception 'Event end time must be after its start time';
  end if;

  return new;
end;
$$;

create trigger events_validate_schedule
before insert or update on public.events
for each row execute function public.validate_event_schedule();

create or replace function public.validate_donation_request()
returns trigger
language plpgsql
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

  -- Lock the item before checking availability. This serializes request
  -- creation with acceptance, withdrawal, and other request inserts.
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

create trigger donation_requests_validate_insert
before insert on public.donation_requests
for each row execute function public.validate_donation_request();

create or replace function public.validate_event_participant()
returns trigger
language plpgsql
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

create trigger event_participants_validate_insert
before insert on public.event_participants
for each row execute function public.validate_event_participant();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_display_name text;
begin
  v_display_name := nullif(
    btrim(new.raw_user_meta_data ->> 'display_name'),
    ''
  );

  if v_display_name is null or char_length(v_display_name) < 2 then
    v_display_name := 'Community Member';
  end if;

  v_display_name := nullif(btrim(left(v_display_name, 60)), '');

  if v_display_name is null or char_length(v_display_name) < 2 then
    v_display_name := 'Community Member';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- These functions are trigger-only implementation details. Keep them
-- unreachable as callable API functions even though trigger functions cannot
-- be invoked successfully outside trigger context.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.validate_item_dates() from public, anon, authenticated;
revoke all on function public.validate_event_schedule() from public, anon, authenticated;
revoke all on function public.validate_donation_request() from public, anon, authenticated;
revoke all on function public.validate_event_participant() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.donation_requests enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.reports enable row level security;

-- Start from no table privileges, then grant only the operations used by the
-- browser client. Lifecycle columns are intentionally excluded from direct
-- updates and are changed only by the security-definer RPCs below.
revoke all on table
  public.profiles,
  public.items,
  public.donation_requests,
  public.events,
  public.event_participants,
  public.reports
from public, anon, authenticated;

grant usage on type
  public.item_category,
  public.item_condition,
  public.item_status,
  public.request_status,
  public.event_type,
  public.event_status,
  public.report_target_type,
  public.report_reason,
  public.report_status
to anon, authenticated;

grant select on public.profiles, public.items, public.events,
  public.event_participants to anon, authenticated;

grant update (display_name, township, avatar_url)
on public.profiles to authenticated;

grant insert (
  donor_id,
  title,
  description,
  category,
  condition,
  township,
  image_path,
  food_expiration_date,
  pickup_deadline
)
on public.items to authenticated;

grant update (
  title,
  description,
  category,
  condition,
  township,
  image_path,
  food_expiration_date,
  pickup_deadline
)
on public.items to authenticated;

grant delete on public.items to authenticated;

grant select on public.donation_requests to authenticated;

grant insert (item_id, requester_id, request_message)
on public.donation_requests to authenticated;

grant insert (creator_id, title, description, event_type, location_name,
  township, starts_at, ends_at)
on public.events to authenticated;

grant update (title, description, event_type, location_name, township,
  starts_at, ends_at)
on public.events to authenticated;

grant delete on public.events to authenticated;

grant insert (event_id, user_id)
on public.event_participants to authenticated;

grant delete on public.event_participants to authenticated;

grant insert (target_type, item_id, event_id, reported_user_id, reason, details)
on public.reports to authenticated;

create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Visible donations are publicly readable"
on public.items for select
to anon, authenticated
using (
  status <> 'withdrawn'
  or donor_id = (select auth.uid())
);

create policy "Users create their own donations"
on public.items for insert
to authenticated
with check ((select auth.uid()) = donor_id);

create policy "Donors update their own donations"
on public.items for update
to authenticated
using ((select auth.uid()) = donor_id)
with check ((select auth.uid()) = donor_id);

create policy "Donors delete available or withdrawn donations"
on public.items for delete
to authenticated
using (
  donor_id = (select auth.uid())
  and status in ('available', 'withdrawn')
);

create policy "Donors and requesters read donation requests"
on public.donation_requests for select
to authenticated
using (
  requester_id = (select auth.uid())
  or exists (
    select 1
    from public.items
    where items.id = donation_requests.item_id
      and items.donor_id = (select auth.uid())
  )
);

create policy "Users request available donations"
on public.donation_requests for insert
to authenticated
with check (
  requester_id = (select auth.uid())
  and exists (
    select 1
    from public.items
    where items.id = donation_requests.item_id
      and items.status = 'available'
      and items.donor_id <> (select auth.uid())
  )
);

create policy "Visible events are publicly readable"
on public.events for select
to anon, authenticated
using (
  status <> 'cancelled'
  or creator_id = (select auth.uid())
);

create policy "Users create their own events"
on public.events for insert
to authenticated
with check ((select auth.uid()) = creator_id);

create policy "Organizers update their own events"
on public.events for update
to authenticated
using ((select auth.uid()) = creator_id)
with check ((select auth.uid()) = creator_id);

create policy "Organizers delete non-completed events"
on public.events for delete
to authenticated
using (
  creator_id = (select auth.uid())
  and status in ('upcoming', 'cancelled')
);

create policy "Participation is publicly readable"
on public.event_participants for select
to anon, authenticated
using (true);

create policy "Users join upcoming events"
on public.event_participants for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.events
    where events.id = event_participants.event_id
      and events.status = 'upcoming'
      and events.starts_at > now()
  )
);

create policy "Users leave events"
on public.event_participants for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "Authenticated users may submit reports"
on public.reports for insert
to authenticated
with check (reporter_id = (select auth.uid()));

-- Request lifecycle functions lock the item before the request. This gives
-- concurrent accept/cancel/decline calls a consistent lock order and ensures
-- exactly one request can reserve an item.
create or replace function public.accept_donation_request(
  p_request_id uuid,
  p_donor_reply text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item_id uuid;
  v_donor_id uuid;
  v_item_status public.item_status;
  v_request_status public.request_status;
  v_reply text := nullif(btrim(p_donor_reply), '');
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Lock the item first, then the request. Another request for the same item
  -- cannot pass this point until the current transaction has finished.
  select r.item_id, i.donor_id, i.status
  into v_item_id, v_donor_id, v_item_status
  from public.donation_requests as r
  join public.items as i on i.id = r.item_id
  where r.id = p_request_id
  for update of i;

  if not found then
    raise exception 'Donation request not found';
  end if;

  if v_donor_id <> auth.uid() then
    raise exception 'Only the donor can accept this request';
  end if;

  select status
  into v_request_status
  from public.donation_requests
  where id = p_request_id
  for update;

  if not found or v_request_status <> 'pending' then
    raise exception 'Donation request is no longer pending';
  end if;

  if v_item_status <> 'available' then
    raise exception 'Donation is not available';
  end if;

  if v_reply is not null and char_length(v_reply) > 500 then
    raise exception 'Pickup note must be 500 characters or fewer';
  end if;

  update public.donation_requests
  set status = 'accepted',
      donor_reply = v_reply
  where id = p_request_id;

  update public.donation_requests
  set status = 'declined'
  where item_id = v_item_id
    and id <> p_request_id
    and status = 'pending';

  update public.items
  set status = 'reserved'
  where id = v_item_id;
end;
$$;

create or replace function public.decline_donation_request(
  p_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item_id uuid;
  v_donor_id uuid;
  v_item_status public.item_status;
  v_request_status public.request_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select r.item_id, i.donor_id, i.status
  into v_item_id, v_donor_id, v_item_status
  from public.donation_requests as r
  join public.items as i on i.id = r.item_id
  where r.id = p_request_id
  for update of i;

  if not found or v_donor_id <> auth.uid() then
    raise exception 'Donation request not found or permission denied';
  end if;

  select status
  into v_request_status
  from public.donation_requests
  where id = p_request_id
  for update;

  if not found or v_request_status <> 'pending' then
    raise exception 'Donation request is no longer pending';
  end if;

  if v_item_status <> 'available' then
    raise exception 'Donation is not available';
  end if;

  update public.donation_requests
  set status = 'declined'
  where id = p_request_id;
end;
$$;

create or replace function public.cancel_donation_request(
  p_request_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item_id uuid;
  v_item_status public.item_status;
  v_requester_id uuid;
  v_request_status public.request_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select r.item_id, r.requester_id, i.status
  into v_item_id, v_requester_id, v_item_status
  from public.donation_requests as r
  join public.items as i on i.id = r.item_id
  where r.id = p_request_id
  for update of i;

  if not found or v_requester_id <> auth.uid() then
    raise exception 'Donation request not found or permission denied';
  end if;

  select status
  into v_request_status
  from public.donation_requests
  where id = p_request_id
  for update;

  if not found or v_request_status <> 'pending' then
    raise exception 'Donation request is no longer pending';
  end if;

  if v_item_status <> 'available' then
    raise exception 'Donation is no longer available';
  end if;

  update public.donation_requests
  set status = 'cancelled'
  where id = p_request_id;
end;
$$;

create or replace function public.complete_donation(
  p_item_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_donor_id uuid;
  v_item_status public.item_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select donor_id, status
  into v_donor_id, v_item_status
  from public.items
  where id = p_item_id
  for update;

  if not found or v_donor_id <> auth.uid() then
    raise exception 'Donation not found or permission denied';
  end if;

  if v_item_status <> 'reserved' then
    raise exception 'Only reserved donations can be completed';
  end if;

  update public.items
  set status = 'completed'
  where id = p_item_id;

  update public.donation_requests
  set status = 'fulfilled'
  where item_id = p_item_id
    and status = 'accepted';
end;
$$;

create or replace function public.withdraw_item(
  p_item_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_donor_id uuid;
  v_item_status public.item_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select donor_id, status
  into v_donor_id, v_item_status
  from public.items
  where id = p_item_id
  for update;

  if not found or v_donor_id <> auth.uid() then
    raise exception 'Donation not found or permission denied';
  end if;

  if v_item_status <> 'available' then
    raise exception 'Only available donations can be withdrawn';
  end if;

  update public.items
  set status = 'withdrawn'
  where id = p_item_id;

  update public.donation_requests
  set status = 'declined'
  where item_id = p_item_id
    and status = 'pending';
end;
$$;

create or replace function public.complete_event(
  p_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_creator_id uuid;
  v_event_status public.event_status;
  v_starts_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select creator_id, status, starts_at
  into v_creator_id, v_event_status, v_starts_at
  from public.events
  where id = p_event_id
  for update;

  if not found or v_creator_id <> auth.uid() then
    raise exception 'Event not found or permission denied';
  end if;

  if v_event_status <> 'upcoming' then
    raise exception 'Event is no longer upcoming';
  end if;

  if v_starts_at > now() then
    raise exception 'An event cannot be completed before it starts';
  end if;

  update public.events
  set status = 'completed'
  where id = p_event_id;
end;
$$;

create or replace function public.cancel_event(
  p_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_creator_id uuid;
  v_event_status public.event_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select creator_id, status
  into v_creator_id, v_event_status
  from public.events
  where id = p_event_id
  for update;

  if not found or v_creator_id <> auth.uid() then
    raise exception 'Event not found or permission denied';
  end if;

  if v_event_status <> 'upcoming' then
    raise exception 'Only upcoming events can be cancelled';
  end if;

  update public.events
  set status = 'cancelled'
  where id = p_event_id;
end;
$$;

revoke all on function public.accept_donation_request(uuid, text) from public;
revoke all on function public.decline_donation_request(uuid) from public;
revoke all on function public.cancel_donation_request(uuid) from public;
revoke all on function public.complete_donation(uuid) from public;
revoke all on function public.withdraw_item(uuid) from public;
revoke all on function public.complete_event(uuid) from public;
revoke all on function public.cancel_event(uuid) from public;

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

-- Storage is public for image delivery, but writes are limited to an
-- authenticated user's UUID folder and UUID filename. Bucket limits provide
-- server-side MIME and size validation independently of the browser.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'item-images',
  'item-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view item images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'item-images');

create policy "Users upload images to their own UUID folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and name ~* (
    '^' || (select auth.uid()::text) ||
    E'/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|jpeg|png|webp)$'
  )
);

create policy "Users update images in their own UUID folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and name ~* (
    '^' || (select auth.uid()::text) ||
    E'/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|jpeg|png|webp)$'
  )
);

create policy "Users delete images in their own UUID folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
