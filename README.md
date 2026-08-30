# Loopify

> Working name for a donation-first community platform that helps people give usable items to people who need them and organize local social-impact events.

## 1. Project Overview

Loopify reduces waste by making local donation simple. A donor creates a post for an item they no longer need, another user requests it, and the donor chooses a recipient and arranges collection. The platform also supports community events such as cleanup campaigns, food-donation drives, clothing drives, and recycling activities.

The first release is intentionally small. Donation is the main experience; item exchange is a later, optional feature.

## 2. MVP Goal

The MVP must prove this complete journey:

1. A visitor understands the project from the landing page.
2. A user creates an account and posts a donation with one image.
3. Other users discover the item through the feed and submit a request.
4. The donor accepts one request and the item becomes reserved.
5. The donor marks the handover as completed.
6. A user creates a community event and other users join it.

If these actions work reliably on the deployed Netlify site, the MVP is successful.

## 3. MVP Scope

### Included

- Public landing page
- Email/password registration and login
- Public donation feed
- Search and filters by category, township, and availability
- Donation creation with one image
- Donation detail page
- Request Donation workflow
- Donor approval, rejection, and completion workflow
- Private pickup/contact note after approval
- My Donations and My Requests dashboards
- Public community-event feed
- Event creation and participation
- Basic user profile
- Responsive mobile-first interface
- Basic report button and safety guidance
- Netlify production deployment

### Not included in the MVP

- Payments or selling
- Real-time chat
- Delivery or courier integration
- Maps and live location tracking
- Item exchange
- AI recommendations, automated moderation, or image recognition beyond the optional listing assistant
- Ratings and badges
- Push notifications
- Organization/admin dashboard
- Native mobile application

These are useful later, but they should not delay the first working release.

## 4. Donation Rules for the MVP

- Listings must be free. Do not display prices.
- Show only a general area or township publicly.
- Reveal pickup instructions only to the accepted recipient.
- Allow only one accepted request per donation.
- A completed donation remains visible as a positive community-impact record.
- For food, accept only sealed, unopened, unexpired products.
- Food posts must include an expiration date and pickup deadline.
- Do not accept medicine, alcohol, weapons, illegal goods, recalled products, or unsafe items.

## 5. Recommended Technology Stack

| Layer | Technology | Reason |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Fast development and simple static deployment |
| Styling | Tailwind CSS | Rapid responsive UI development |
| Routing | React Router | Client-side pages without a server framework |
| Forms | React Hook Form + Zod | Form state and validation |
| Data fetching | TanStack Query | Caching, loading states, and mutations |
| Icons | Lucide React | Lightweight consistent icons |
| Notifications | Sonner | Simple success and error messages |
| Authentication | Supabase Auth | Email/password authentication without building an auth server |
| Database | Supabase PostgreSQL | Hosted relational database with Row Level Security |
| Image storage | Supabase Storage | Direct browser uploads with access policies |
| Hosting | Netlify | Git-based deployment of the Vite build |
| Source control | GitHub | Collaboration and Netlify continuous deployment |

### Why this stack is suitable for Netlify

Vite produces a static `dist` directory that Netlify can deploy directly. Supabase provides authentication, PostgreSQL, and file storage, so the MVP does not require an always-running Flask or Express server. If trusted server-side logic is required later, add small Netlify Functions instead of deploying a separate backend.

## 6. High-Level Architecture

- The React application runs in the user's browser and is deployed by Netlify.
- Supabase Auth manages sessions and user identities.
- The browser accesses Supabase using the publishable key.
- PostgreSQL stores profiles, donations, requests, events, and participation records.
- Supabase Storage stores public donation images.
- Row Level Security controls which rows each user may read or change.
- Database functions perform sensitive multi-step operations such as accepting a donation request.

Never put a Supabase secret key or service-role key in the React application. A `VITE_` variable is included in browser code and is visible to users. Only the Supabase publishable key belongs there; database security must be enforced with Row Level Security.

## 7. Core User Roles

The MVP uses one account type. A signed-in user can act as:

- **Donor:** creates and manages donation listings.
- **Recipient:** requests available donations.
- **Organizer:** creates community events.
- **Volunteer:** joins community events.

No separate role-selection screen is required.

## 8. Main Pages and Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and project explanation |
| `/feed` | Public | Donation feed and filters |
| `/donations/:id` | Public | Donation details and request action |
| `/login` | Public | Login |
| `/register` | Public | Account creation |
| `/donate` | Signed in | Create a donation |
| `/my-donations` | Signed in | Manage posted donations and requests |
| `/my-requests` | Signed in | Track requested donations |
| `/events` | Public | Browse community events |
| `/events/:id` | Public | Event details and participant count |
| `/events/create` | Signed in | Create an event |
| `/profile` | Signed in | Edit display name and township |
| `*` | Public | Not-found page |

## 9. Primary Workflows

### Donate an item

1. The donor signs in and opens `/donate`.
2. The donor enters the item details and uploads one image.
3. The image is saved under `item-images/<user-id>/<file-name>`.
4. The donation row is created with status `available`.
5. The new donation appears in the public feed.

### Request a donation

1. A recipient opens an available donation.
2. The recipient signs in if necessary.
3. The recipient submits a short request message.
4. The request appears in the donor's My Donations page.

### Accept and complete a donation

1. The donor accepts one pending request.
2. The accepted request changes to `accepted`.
3. Other pending requests change to `declined`.
4. The donation changes to `reserved`.
5. The donor provides a private pickup/contact note.
6. After handover, the donor marks the donation `completed`.

### Create and join an event

1. A signed-in user creates an upcoming event.
2. The event appears in the public event feed.
3. Other signed-in users join or leave the event.
4. The organizer can edit, complete, or cancel the event.

## 10. Suggested Project Structure

```text
loopify/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── donations/
│   │   ├── events/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── donations/
│   │   ├── events/
│   │   └── profiles/
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── queryClient.ts
│   │   └── validators.ts
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── DonationDetailsPage.tsx
│   │   ├── CreateDonationPage.tsx
│   │   ├── MyDonationsPage.tsx
│   │   ├── MyRequestsPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── EventDetailsPage.tsx
│   │   ├── CreateEventPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   └── ProtectedRoute.tsx
│   ├── types/
│   │   └── database.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_fix_participation_validation_rls.sql
│       └── 20260830155042_harden_security_advisor_findings.sql
├── .env.example
├── .gitignore
├── netlify.toml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Organize code by feature instead of placing all database calls in page components. A page should assemble components; the corresponding feature folder should contain queries, mutations, schemas, and feature-specific types.

## 11. Local Project Setup

### Prerequisites

- Node.js 22 or another currently supported LTS release
- npm and Git
- A Supabase project for real data

Check the local tools:

```bash
node --version
npm --version
git --version
```

Clone the existing Loopify repository and install the locked dependency set:

```bash
git clone https://github.com/Aikozzzz/loopifymvp.git
cd loopifymvp
npm ci
```

Create a local environment file from the checked-in example. In PowerShell use
`Copy-Item .env.example .env.local`; in macOS/Linux use `cp .env.example .env.local`.
Set the real Supabase project URL and browser-safe publishable key in `.env.local`.

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

Start the app:

```bash
npm run dev
```

The application is served at `http://localhost:5173`. Do not put a Supabase
secret or service-role key in a `VITE_` variable.

## 12. Supabase Setup

### Create the project

1. Create a new project in the Supabase dashboard.
2. Choose the region closest to the expected users.
3. Save the database password in a password manager.
4. Open **Project Settings → API**.
5. Copy the Project URL and publishable key.

### Environment variables

Create `.env.example` in the repository root:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

Create `.env.local` with the real values:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-real-publishable-key
```

Add local environment files to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

Do not commit `.env.local`.

### Client configuration

The client is already implemented in `src/lib/env.ts` and
`src/lib/supabase.ts`. The environment module validates the URL and rejects
service-role keys before the typed client is created. Do not add another
Supabase client or expose a secret key in browser code. The following excerpt
shows the underlying client shape for reference:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
```

## 13. Database Migrations

The canonical schema is already checked in at
`supabase/migrations/001_initial_schema.sql`. Apply that complete file to a
new Supabase project. The follow-up
`supabase/migrations/002_fix_participation_validation_rls.sql` fixes row-level
security validation for donation requests and event participation. The latest
`20260830155042_harden_security_advisor_findings.sql` pins function search
paths, removes anonymous access to lifecycle RPCs, and prevents broad listing
of public item-image objects.

Using the Supabase CLI is the repeatable path:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase gen types typescript --linked --schema public > src/types/database.ts
```

The first command opens the Supabase login flow. `db push` applies all pending
migrations, including both security fixes. Regenerate `src/types/database.ts`
after every schema change and review the generated diff before committing it.

If the CLI is unavailable, paste the entire contents of
`supabase/migrations/001_initial_schema.sql` into **Supabase Dashboard → SQL
Editor** and run it once for a new project. If the initial migration is
already applied, run the pending migration files in order:
`002_fix_participation_validation_rls.sql` and then
`20260830155042_harden_security_advisor_findings.sql`. The migration files in
the repository are the source of truth; the following SQL is retained only as
a schema reference and should not be run as a separate partial migration.

```sql
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

create type public.event_status as enum (
  'upcoming',
  'completed',
  'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  township text check (township is null or char_length(township) <= 80),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 10 and 1500),
  category public.item_category not null,
  condition public.item_condition not null,
  status public.item_status not null default 'available',
  township text not null check (char_length(township) between 2 and 80),
  image_path text not null,
  food_expiration_date date,
  pickup_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sealed_food_requires_dates check (
    category <> 'sealed_food'
    or (food_expiration_date is not null and pickup_deadline is not null)
  )
);

create table public.donation_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  request_message text not null check (char_length(request_message) between 10 and 500),
  status public.request_status not null default 'pending',
  donor_reply text check (donor_reply is null or char_length(donor_reply) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, requester_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  event_type text not null check (event_type in (
    'cleanup',
    'food_drive',
    'clothing_drive',
    'recycling',
    'other'
  )),
  location_name text not null check (char_length(location_name) between 2 and 150),
  township text not null check (char_length(township) between 2 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.event_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_event_time check (ends_at is null or ends_at > starts_at)
);

create table public.event_participants (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index items_feed_index
  on public.items (status, category, created_at desc);

create index items_township_index
  on public.items (township);

create index donation_requests_item_index
  on public.donation_requests (item_id, status, created_at);

create index events_feed_index
  on public.events (status, starts_at);

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Community Member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.donation_requests enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;

grant select on public.profiles, public.items, public.events, public.event_participants to anon;
grant select on public.profiles, public.items, public.events, public.event_participants to authenticated;
grant select, insert on public.donation_requests to authenticated;
grant insert, update, delete on public.profiles, public.items, public.events, public.event_participants to authenticated;

create policy "Profiles are publicly readable"
on public.profiles for select
using (true);

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Visible donations are publicly readable"
on public.items for select
using (status <> 'withdrawn' or auth.uid() = donor_id);

create policy "Users create their own donations"
on public.items for insert
to authenticated
with check (auth.uid() = donor_id);

create policy "Donors update their own donations"
on public.items for update
to authenticated
using (auth.uid() = donor_id)
with check (auth.uid() = donor_id);

create policy "Donors delete their own donations"
on public.items for delete
to authenticated
using (auth.uid() = donor_id);

create policy "Participants read donation requests"
on public.donation_requests for select
to authenticated
using (
  requester_id = auth.uid()
  or exists (
    select 1 from public.items
    where items.id = donation_requests.item_id
      and items.donor_id = auth.uid()
  )
);

create policy "Users request available donations"
on public.donation_requests for insert
to authenticated
with check (
  requester_id = auth.uid()
  and exists (
    select 1 from public.items
    where items.id = donation_requests.item_id
      and items.status = 'available'
      and items.donor_id <> auth.uid()
  )
);

create policy "Visible events are publicly readable"
on public.events for select
using (status <> 'cancelled' or creator_id = auth.uid());

create policy "Users create their own events"
on public.events for insert
to authenticated
with check (creator_id = auth.uid());

create policy "Organizers update their own events"
on public.events for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "Organizers delete their own events"
on public.events for delete
to authenticated
using (creator_id = auth.uid());

create policy "Participation is publicly readable"
on public.event_participants for select
using (true);

create policy "Users join upcoming events"
on public.event_participants for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.events
    where events.id = event_participants.event_id
      and events.status = 'upcoming'
      and events.starts_at > now()
  )
);

create policy "Users leave events"
on public.event_participants for delete
to authenticated
using (user_id = auth.uid());

create or replace function public.accept_donation_request(
  p_request_id uuid,
  p_donor_reply text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_item_id uuid;
  v_donor_id uuid;
  v_item_status public.item_status;
begin
  select r.item_id, i.donor_id, i.status
  into v_item_id, v_donor_id, v_item_status
  from public.donation_requests r
  join public.items i on i.id = r.item_id
  where r.id = p_request_id
    and r.status = 'pending'
  for update of r, i;

  if v_item_id is null then
    raise exception 'Pending request not found';
  end if;

  if v_donor_id <> auth.uid() then
    raise exception 'Only the donor can accept this request';
  end if;

  if v_item_status <> 'available' then
    raise exception 'Donation is not available';
  end if;

  update public.donation_requests
  set status = 'accepted', donor_reply = p_donor_reply
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

create or replace function public.decline_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.donation_requests r
  set status = 'declined'
  from public.items i
  where r.id = p_request_id
    and r.item_id = i.id
    and i.donor_id = auth.uid()
    and r.status = 'pending';

  if not found then
    raise exception 'Pending request not found or permission denied';
  end if;
end;
$$;

create or replace function public.cancel_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.donation_requests
  set status = 'cancelled'
  where id = p_request_id
    and requester_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Pending request not found or permission denied';
  end if;
end;
$$;

create or replace function public.complete_donation(p_item_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.items
  set status = 'completed'
  where id = p_item_id
    and donor_id = auth.uid()
    and status = 'reserved';

  if not found then
    raise exception 'Reserved donation not found or permission denied';
  end if;

  update public.donation_requests
  set status = 'fulfilled'
  where item_id = p_item_id
    and status = 'accepted';
end;
$$;

revoke all on function public.accept_donation_request(uuid, text) from public;
revoke all on function public.decline_donation_request(uuid) from public;
revoke all on function public.cancel_donation_request(uuid) from public;
revoke all on function public.complete_donation(uuid) from public;

grant execute on function public.accept_donation_request(uuid, text) to authenticated;
grant execute on function public.decline_donation_request(uuid) to authenticated;
grant execute on function public.cancel_donation_request(uuid) to authenticated;
grant execute on function public.complete_donation(uuid) to authenticated;
```

The migration is a starting point, not a substitute for security testing. Test every anonymous and authenticated operation before allowing real users.

### Generate TypeScript database types

The migration setup command already generates the checked-in types. To
regenerate them later:

```bash
npx supabase gen types typescript --linked --schema public > src/types/database.ts
```

Regenerate this file whenever the database schema changes.

## 14. Supabase Storage Setup

The canonical migration creates the `item-images` bucket and its RLS policies.
Verify these settings in **Supabase Dashboard → Storage**:

- Bucket name: `item-images`
- Public bucket: enabled
- Maximum file size: 5 MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

The bucket is public so direct object URLs can serve donation images. Public
downloads do not require a broad `SELECT` policy on `storage.objects`; leaving
one in place would also allow clients to list every object in the bucket.
Use compressed WebP or JPEG images in the UI. Validate type and size before
upload.

Do not rerun the policy reference below after applying the repository
migration; duplicate policy names will fail. It is included to document the
intended ownership boundary for older projects that were provisioned manually:

```sql
create policy "Users upload images to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update images in their own folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete images in their own folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

Generate unique filenames in the application:

```ts
const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`

const { error } = await supabase.storage
  .from('item-images')
  .upload(imagePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
```

If the database insert fails after upload, delete the uploaded image so an unused file is not left behind.

## 15. Authentication Configuration

For the MVP, use email and password only.

In **Supabase Dashboard → Authentication → URL Configuration**:

- During development, add `http://localhost:5173/**` to Redirect URLs.
- After deployment, set Site URL to the exact Netlify production URL.
- Add the exact production callback paths required by the app.
- If Netlify Deploy Previews are used, add a preview URL pattern only for preview builds.

Example registration:

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { display_name: displayName },
    emailRedirectTo: `${window.location.origin}/login`,
  },
})
```

### SMTP and signup limits

Supabase’s built-in email provider is intended for testing and has a small
project-wide send limit. Repeated signup confirmation requests can return
HTTP 429 responses even when the browser and redirect URL are configured
correctly. Loopify now shows a clear rate-limit message and pauses the signup
button for 60 seconds to prevent immediate retry bursts.

Before a production deployment, configure a custom SMTP provider in the
Supabase Auth settings, verify the sender domain, and keep email confirmation
enabled. Do not try to solve the provider quota with a browser API key or by
retrying signup automatically. For local-only testing, email confirmation may
be disabled temporarily, but it should not be disabled for a public launch.

In **Supabase Dashboard → Authentication → Password Security**, enable
**Prevent the use of leaked passwords**. This Auth setting is managed in the
dashboard rather than through the SQL migrations and should be enabled before
production launch. Supabase makes this control available on the Pro plan and
above.

Protect write routes in the React router, but do not treat route protection as database security. Row Level Security remains the actual authorization layer.

## 16. Important Data Operations

### Create a donation request

```ts
const { error } = await supabase.from('donation_requests').insert({
  item_id: itemId,
  requester_id: user.id,
  request_message: message,
})
```

### Accept a request safely

Use the database function so acceptance, rejection of other requests, and reservation happen in one transaction:

```ts
const { error } = await supabase.rpc('accept_donation_request', {
  p_request_id: requestId,
  p_donor_reply: pickupNote,
})
```

### Complete a donation

```ts
const { error } = await supabase.rpc('complete_donation', {
  p_item_id: itemId,
})
```

### Join an event

```ts
const { error } = await supabase.from('event_participants').insert({
  event_id: eventId,
  user_id: user.id,
})
```

Handle unique-constraint errors with friendly messages such as “You already requested this donation” or “You already joined this event.”

## 17. Feed Query Strategy

Keep the first feed simple:

- Display `available`, `reserved`, and recently `completed` donations.
- Place available donations first.
- Default sort: newest first.
- Use 12 items per page.
- Filter on the server through Supabase queries rather than downloading every row.
- Add full-text search only after the basic filter works.

Example:

```ts
let query = supabase
  .from('items')
  .select('*, profiles!items_donor_id_fkey(display_name, township)', {
    count: 'exact',
  })
  .neq('status', 'withdrawn')
  .order('created_at', { ascending: false })
  .range(page * 12, page * 12 + 11)

if (category) query = query.eq('category', category)
if (township) query = query.eq('township', township)
```

## 18. UI Guidelines

- Use a warm community-focused visual style rather than an e-commerce style.
- Use **Donate an Item** as the primary call to action.
- Use **Request Donation**, not Buy or Order.
- Show availability clearly with Available, Reserved, and Donated labels.
- Avoid displaying exact home addresses publicly.
- Display safety reminders near pickup information.
- Make all major actions usable on a phone.
- Provide skeleton loading states, empty states, and clear error messages.
- Compress images before upload when possible.

Suggested colors:

- Primary green: `#237A57`
- Dark green: `#15523C`
- Warm background: `#F7FAF8`
- Accent yellow: `#F2C14E`
- Error red: `#C2413A`

## 19. Validation Requirements

Validate forms in both the UI and the database.

### Donation form

- Title: 3–100 characters
- Description: 10–1,500 characters
- Category: required
- Condition: required
- Township: required
- Image: JPEG, PNG, or WebP; maximum 5 MB
- Food expiration: required only for sealed food
- Food expiration must be in the future
- Pickup deadline: required for sealed food

### Request form

- Message: 10–500 characters
- A donor cannot request their own item
- A user cannot request the same item twice
- Only available donations can receive new requests

### Event form

- Title: 3–120 characters
- Description: 10–2,000 characters
- Public location and township: required
- Start time must be in the future
- End time, if provided, must be after the start time

## 20. Netlify Configuration

The checked-in `netlify.toml` builds `dist`, rewrites every client-side route
to `index.html`, and sends baseline security headers:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), geolocation=(), microphone=()"
```

The rewrite is required so refreshing a React Router URL such as `/events/123`
serves `index.html` instead of returning a Netlify 404. The CSP in the actual
file allows the app, Supabase API/realtime, Supabase-hosted images, and the
Google-hosted Figtree/DM Mono styles used by the design.

Test the production build locally before every deployment:

```bash
npm run lint
npm run type-check
npm test
npm run build
npm run preview
```

Open the preview URL and test direct navigation to `/`, `/feed`, `/events`,
and a nested detail URL. Environment variables belong in Netlify’s UI or CLI,
not in `netlify.toml`.

## 21. Deploy to Netlify

### Push to GitHub

```bash
git add .
git commit -m "feat: complete Loopify MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/loopify.git
git push -u origin main
```

If `origin` already exists, do not add it again.

### Connect the repository

1. Open Netlify.
2. Select **Add new project → Import an existing project**.
3. Connect GitHub and choose the Loopify repository.
4. Confirm the build command is `npm run build`.
5. Confirm the publish directory is `dist`.
6. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
7. Deploy the site.

Store environment values in the Netlify environment-variable settings, not in `netlify.toml` or Git.

### Complete Supabase production configuration

After the first Netlify deployment:

1. Copy the final `https://...netlify.app` URL.
2. Set it as the Supabase Auth Site URL.
3. Add the necessary exact redirect URL paths.
4. Trigger a fresh Netlify deployment if environment values changed.

### Production smoke test

- Open the landing page in a private browser window.
- Register a donor account.
- Create a donation with an image.
- Register a second recipient account.
- Request the donation.
- Accept it from the donor account.
- Confirm that other requests are declined and the item is reserved.
- Mark the handover completed.
- Create and join an event.
- Refresh nested URLs such as `/feed` and `/events` to confirm there are no 404 errors.
- Confirm one user cannot edit another user's records.
- Confirm no secret/service-role key appears in the deployed JavaScript or repository.

## 22. Testing Checklist

### Automated commands

```bash
npm run lint
npm run type-check
npm test
npm run build
```

The unit suite runs in jsdom with Vitest and Testing Library. It covers the
donation, request, event, auth, and profile validation boundaries; donation
filters and service query construction; status badges; request privacy
rendering; event participation controls; and protected-route permissions.

Install the local Playwright browser once, then run public smoke tests:

```bash
npx playwright install chromium
npm run test:e2e
```

The smoke suite uses an isolated fake Supabase REST response, so it can verify
landing/feed/events rendering, filter URL state, direct-route refreshes,
mobile width, and form-control labels without credentials. The credentialed
two-user donation and event lifecycle is skipped unless all of these variables
are set:

```powershell
$env:E2E_DONOR_EMAIL = "donor@example.com"
$env:E2E_DONOR_PASSWORD = "replace-me"
$env:E2E_RECIPIENT_EMAIL = "recipient@example.com"
$env:E2E_RECIPIENT_PASSWORD = "replace-me"
npm run test:e2e
```

Those accounts must exist in the real Supabase project configured by
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The lifecycle creates
real test data, uploads an image, and should be run against a disposable
project or with a cleanup plan.

### Real-project RLS authorization matrix

The automated browser smoke suite cannot prove PostgreSQL authorization. Run
these checks with an anonymous browser session and two separate Supabase
accounts after applying the migration:

- **Anonymous:** can read non-withdrawn donations, non-cancelled events,
  public profiles, and participant counts; cannot create or update donations,
  requests, events, participation, or reports.
- **Owner:** can create and edit their own available donation, withdraw it
  through the RPC, and manage only their own event; cannot edit another
  owner’s records or accept requests for another owner’s donation.
- **Requester:** can create one request for another user’s available donation,
  read their own request, cancel a pending request, and join or leave an
  upcoming event; cannot read unrelated private requests or change donation
  status.
- **Unrelated user:** cannot edit or delete another user’s donation or event,
  cannot accept, decline, or complete another donor’s workflow, and cannot
  access private pickup notes that belong to a different request.

### Authentication

- [ ] Register with valid information
- [ ] Reject invalid email and weak password
- [ ] Login and logout
- [ ] Restore the session after refresh
- [ ] Redirect signed-out users away from write pages

### Donations

- [ ] Create a normal donation
- [ ] Create a valid sealed-food donation
- [ ] Reject food without expiration and pickup dates
- [ ] Reject unsupported or oversized images
- [ ] Filter feed by category and township
- [ ] Edit or withdraw an owned donation
- [ ] Prevent editing another donor's item

### Requests

- [ ] Submit one request
- [ ] Prevent duplicate requests
- [ ] Prevent self-requesting
- [ ] Allow only the donor to accept or decline
- [ ] Accept exactly one request
- [ ] Decline remaining pending requests
- [ ] Complete a reserved donation

### Events

- [ ] Create and edit an event
- [ ] Join and leave an event
- [ ] Prevent duplicate participation
- [ ] Prevent joining a cancelled or past event

### Deployment

- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] `npm run test:e2e` public smoke tests pass
- [ ] Environment variables exist in Netlify
- [ ] Direct route refresh works
- [ ] Production authentication redirects work
- [ ] Mobile layout works at 320 px width

## 23. MVP Delivery Plan

### Milestone 1 — Foundation

- Create React/Vite project
- Configure Tailwind, router, query client, and Supabase client
- Create database migration and storage bucket
- Implement registration, login, logout, and profile loading

### Milestone 2 — Donation feed

- Build the landing page
- Build donation cards and public feed
- Add category and township filters
- Build donation details
- Build donation creation and image upload

### Milestone 3 — Request workflow

- Add request form
- Build My Requests
- Build donor request management
- Connect accept, decline, cancel, and complete database functions

### Milestone 4 — Community events

- Build the event feed and detail page
- Add event creation and editing
- Add join and leave actions

### Milestone 5 — Security and deployment

- Test Row Level Security with two accounts
- Add empty, loading, error, and confirmation states
- Complete responsive UI testing
- Run lint and production build
- Deploy to Netlify
- Run the production smoke test

Finish each milestone before beginning optional enhancements.

## 24. Definition of Done for the MVP

The MVP is complete only when:

- A real user can finish the donation workflow without database access or developer help.
- A second user can request and receive a donation.
- Only the donor can manage a donation and its requests.
- Community events can be created and joined.
- Images load correctly after deployment.
- Refreshing any public route does not produce a 404.
- The application works on desktop and mobile layouts.
- Row Level Security has been tested with anonymous users and at least two authenticated accounts.
- The production smoke test passes on the Netlify URL.

## 25. AI Donation Listing Assistant

Loopify includes an optional, donor-triggered assistant that drafts listing details from a selected donation image. It does not publish automatically, set an item condition, create prices, or guarantee that a suggestion is correct.

### Usage

1. Select or upload an image in the donation form.
2. Choose **Suggest Details with AI**.
3. Review and edit the title, description, and category.
4. Choose the item condition yourself.
5. For sealed food, provide a future expiration date and pickup deadline before publishing.

The assistant displays an explicit disclosure and presents safety flags as possible warnings only. The returned text is rendered as plain text, never as HTML.

### Netlify Function configuration

The frontend calls `POST /.netlify/functions/analyze-donation` with the current Supabase access token:

```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

```json
{
  "imageUrl": "https://your-project-ref.supabase.co/storage/v1/object/public/item-images/<user-id>/<file-name>"
}
```

The function returns `{ "suggestion": { ... } }` on success. Errors always use `{ "error": { "code": "...", "message": "..." } }`.

Configure these variables in Netlify’s site environment settings. They are server-side function variables and must not use the `VITE_` prefix:

```dotenv
OPENAI_API_KEY=replace_with_server_secret
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

Keep only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the browser environment. Never set `VITE_OPENAI_API_KEY`, a Supabase service-role key, or any other secret in frontend code or `.env.local` values that are shipped to Netlify’s client build.

For local function testing, use the Netlify CLI with the variables loaded from a local, uncommitted environment file:

```bash
npx netlify dev
```

The function rejects non-POST requests, oversized bodies, malformed URLs, external image hosts, and images outside the authenticated user’s `item-images/<user-id>/` folder. It authenticates the bearer token with Supabase, validates the structured AI response with Zod, avoids logging credentials, and returns a controlled unavailable response when `OPENAI_API_KEY` or `OPENAI_MODEL` is not configured. AI calls must be mocked in tests; no paid request belongs in the test suite.

## 26. Post-MVP Roadmap

Add features only after the donation MVP is stable.

### Phase 2

- Optional item exchange
- In-app notifications
- Donation ratings and trust badges
- Saved categories and townships
- Report review and lightweight moderation dashboard
- Multiple images per donation
- Event capacity and attendance confirmation

### Phase 3

- More advanced AI-assisted safety and matching workflows
- Image safety and prohibited-item screening
- Need-and-location-based donation matching
- Impact analytics for communities and organizations
- Verified NGO and community-organization accounts
- Optional Netlify Functions for trusted moderation and notification tasks

## 27. Safety and Privacy Notes

- Never show a home address in a public listing.
- Encourage pickup in a safe public location when possible.
- Do not publicly expose phone numbers or private contact details.
- Show private pickup information only to the accepted recipient.
- Provide reporting and blocking before opening the platform widely.
- Publish clear prohibited-item, food-safety, privacy, and community rules.
- Do not claim that the platform independently guarantees item quality or user identity.

## 28. Useful Official Documentation

- [Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Netlify JavaScript SPA configuration](https://docs.netlify.com/build/configure-builds/javascript-spas/)
- [Netlify redirects and rewrites](https://docs.netlify.com/manage/routing/redirects/overview/)
- [Netlify environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)
- [Supabase React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

## 29. License

Choose and add a license before accepting outside contributions. MIT is a common choice for a student or hackathon open-source project.

