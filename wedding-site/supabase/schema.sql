create extension if not exists pgcrypto;

create table if not exists public.rsvp_households (
  id uuid primary key default gen_random_uuid(),
  household_name text not null,
  normalized_household_name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rsvp_guests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.rsvp_households(id) on delete cascade,
  guest_name text not null,
  normalized_guest_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

update public.rsvp_guests
set normalized_guest_name = lower(regexp_replace(trim(guest_name), '\\s+', ' ', 'g'))
where normalized_guest_name is null;

alter table public.rsvp_guests
alter column normalized_guest_name set not null;

create unique index if not exists rsvp_guests_normalized_guest_name_unique
on public.rsvp_guests(normalized_guest_name);

create table if not exists public.rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references public.rsvp_households(id) on delete cascade,
  submitted_household_name text not null,
  confirmation_code text not null unique,
  attending_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rsvp_guest_responses (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.rsvp_submissions(id) on delete cascade,
  guest_id uuid not null references public.rsvp_guests(id) on delete cascade,
  attending boolean not null,
  dietary_restrictions text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  unique (submission_id, guest_id)
);

create index if not exists rsvp_guests_household_id_idx on public.rsvp_guests(household_id);
create index if not exists rsvp_guest_responses_submission_id_idx on public.rsvp_guest_responses(submission_id);

comment on column public.rsvp_households.normalized_household_name is
'Store a lowercase normalized household label here. For name-only RSVP, every household label must be unique.';
comment on column public.rsvp_guests.normalized_guest_name is
'Store a lowercase normalized guest label here. For guest-name RSVP, every invited guest name must be unique after normalization.';

insert into public.rsvp_households (household_name, normalized_household_name)
values
  ('Smith Family', 'smith family'),
  ('Taylor Household', 'taylor household')
on conflict (normalized_household_name) do nothing;

insert into public.rsvp_guests (household_id, guest_name, normalized_guest_name, sort_order)
select h.id, guests.guest_name, guests.normalized_guest_name, guests.sort_order
from public.rsvp_households h
join (
  values
    ('smith family', 'Jeff Smith', 'jeff smith', 1),
    ('smith family', 'Casey Smith', 'casey smith', 2),
    ('taylor household', 'Avery Taylor', 'avery taylor', 1)
) as guests(normalized_household_name, guest_name, normalized_guest_name, sort_order)
  on guests.normalized_household_name = h.normalized_household_name
where not exists (
  select 1
  from public.rsvp_guests g
  where g.household_id = h.id and g.guest_name = guests.guest_name
);
