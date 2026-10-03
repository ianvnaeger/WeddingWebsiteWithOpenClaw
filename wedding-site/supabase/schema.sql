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
  submitted_guest_name text not null default '',
  attending boolean not null,
  dietary_restrictions text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  unique (submission_id, guest_id)
);

alter table public.rsvp_guest_responses
add column if not exists submitted_guest_name text not null default '';

create index if not exists rsvp_guests_household_id_idx on public.rsvp_guests(household_id);
create index if not exists rsvp_guest_responses_submission_id_idx on public.rsvp_guest_responses(submission_id);

create or replace view public.rsvp_export_readable as
select
  s.id as submission_id,
  s.submitted_household_name as household_name,
  h.household_name as invited_household_name,
  g.sort_order as guest_sort_order,
  g.guest_name as invited_guest_name,
  r.submitted_guest_name,
  case
    when r.attending then 'Attending'
    else 'Declined'
  end as response,
  nullif(r.dietary_restrictions, '') as dietary_restrictions,
  s.attending_count,
  s.confirmation_code,
  s.updated_at as submitted_at
from public.rsvp_submissions s
join public.rsvp_guest_responses r on r.submission_id = s.id
join public.rsvp_guests g on g.id = r.guest_id
join public.rsvp_households h on h.id = s.household_id;

comment on column public.rsvp_households.normalized_household_name is
'Store a lowercase normalized household label here. For name-only RSVP, every household label must be unique.';
comment on column public.rsvp_guests.normalized_guest_name is
'Store a lowercase normalized guest label here. For guest-name RSVP, every invited guest name must be unique after normalization.';

insert into public.rsvp_households (household_name, normalized_household_name)
values
  ('Philip Bondurant household', 'philip bondurant household'),
  ('Paul Bondurant household', 'paul bondurant household'),
  ('Samuel Bondurant household', 'samuel bondurant household'),
  ('Cindy Naeger household', 'cindy naeger household'),
  ('Tara Blakely household', 'tara blakely household'),
  ('Rielle Naeger household', 'rielle naeger household'),
  ('Austin Gray household', 'austin gray household'),
  ('Brett Pawlak household', 'brett pawlak household'),
  ('Chris Whetsel household', 'chris whetsel household'),
  ('Jackson Chandler household', 'jackson chandler household'),
  ('Chase Skawinski household', 'chase skawinski household'),
  ('Landen Eagen household', 'landen eagen household'),
  ('Cameron Warder household', 'cameron warder household'),
  ('Gabe Ort household', 'gabe ort household'),
  ('Peter Bransgaard household', 'peter bransgaard household'),
  ('Ole Bransgaard household', 'ole bransgaard household'),
  ('Jordan Arneson household', 'jordan arneson household'),
  ('Nick Tucker household', 'nick tucker household'),
  ('Matt Maxwell household', 'matt maxwell household'),
  ('Jimmy Patterson household', 'jimmy patterson household'),
  ('Joey Trom household', 'joey trom household'),
  ('John Hansen household', 'john hansen household'),
  ('Nick Richman household', 'nick richman household'),
  ('Emma Buckley household', 'emma buckley household'),
  ('Katarina Peterson household', 'katarina peterson household'),
  ('Nick Trunko household', 'nick trunko household'),
  ('Matt Trunko household', 'matt trunko household'),
  ('Grease household', 'grease household'),
  ('Nick O''Gorman household', 'nick o''gorman household'),
  ('Josh Westbrook household', 'josh westbrook household'),
  ('Joshua Coulson household', 'joshua coulson household'),
  ('Dan Flores household', 'dan flores household'),
  ('Isaiah Nicolai household', 'isaiah nicolai household'),
  ('Alex Larios household', 'alex larios household'),
  ('Aldo Tuccillo household', 'aldo tuccillo household'),
  ('Billy Donley household', 'billy donley household'),
  ('Richard Oman household', 'richard oman household'),
  ('Ben Thornberry household', 'ben thornberry household'),
  ('Jacob Darbyshire household', 'jacob darbyshire household'),
  ('Jason Lohe household', 'jason lohe household'),
  ('Hahn Lee household', 'hahn lee household'),
  ('Nick Chapkey household', 'nick chapkey household'),
  ('Sam Starke household', 'sam starke household'),
  ('Celebelian household', 'celebelian household'),
  ('Aaron Ork household', 'aaron ork household'),
  ('Joe Tam household', 'joe tam household'),
  ('Jeff Naeger household', 'jeff naeger household'),
  ('Craig Naeger household', 'craig naeger household'),
  ('Candice Cahill household', 'candice cahill household'),
  ('Shawn Robinson household', 'shawn robinson household'),
  ('Brian Robinson household', 'brian robinson household'),
  ('Kelly Emanuel household', 'kelly emanuel household'),
  ('Anna Dimaano household', 'anna dimaano household'),
  ('Rommel Dimaano household', 'rommel dimaano household'),
  ('Steve Melody household', 'steve melody household'),
  ('Meredith Melody-Hubbell household', 'meredith melody-hubbell household'),
  ('Debbie Bondurant household', 'debbie bondurant household'),
  ('Daniel Bondurant household', 'daniel bondurant household'),
  ('Issac Bondurant household', 'issac bondurant household'),
  ('Hannah Bondurant household', 'hannah bondurant household'),
  ('Joanna Wilson household', 'joanna wilson household'),
  ('Steve Birmingham household', 'steve birmingham household'),
  ('Connie Estorninos household', 'connie estorninos household'),
  ('Ben Gliedt household', 'ben gliedt household')
on conflict (normalized_household_name) do nothing;

insert into public.rsvp_guests (household_id, guest_name, normalized_guest_name, sort_order)
select h.id, guests.guest_name, guests.normalized_guest_name, guests.sort_order
from public.rsvp_households h
join (
  values
    ('philip bondurant household', 'Philip Bondurant', 'philip bondurant', 1),
    ('philip bondurant household', 'Amanda Bondurant', 'amanda bondurant', 2),
    ('paul bondurant household', 'Paul Bondurant', 'paul bondurant', 1),
    ('paul bondurant household', 'Luisa Quitalo', 'luisa quitalo', 2),
    ('paul bondurant household', 'Ada Bondurant-Quitalo', 'ada bondurant-quitalo', 3),
    ('samuel bondurant household', 'Samuel Bondurant', 'samuel bondurant', 1),
    ('samuel bondurant household', 'Hannah McWilliams', 'hannah mcwilliams', 2),
    ('cindy naeger household', 'Cindy Naeger', 'cindy naeger', 1),
    ('cindy naeger household', 'Scott Naeger', 'scott naeger', 2),
    ('tara blakely household', 'Tara Blakely', 'tara blakely', 1),
    ('tara blakely household', 'Tyler Blakely', 'tyler blakely', 2),
    ('tara blakely household', 'Tom Blakely', 'tom blakely', 3),
    ('tara blakely household', 'Elin Blakely', 'elin blakely', 4),
    ('rielle naeger household', 'Rielle Naeger', 'rielle naeger', 1),
    ('rielle naeger household', 'Charlie', 'charlie', 2),
    ('austin gray household', 'Austin Gray', 'austin gray', 1),
    ('austin gray household', 'Bryani', 'bryani', 2),
    ('brett pawlak household', 'Brett Pawlak', 'brett pawlak', 1),
    ('brett pawlak household', 'Rachel Pawlak', 'rachel pawlak', 2),
    ('brett pawlak household', 'Willow Pawlak', 'willow pawlak', 3),
    ('chris whetsel household', 'Chris Whetsel', 'chris whetsel', 1),
    ('chris whetsel household', 'Libby Freihaut', 'libby freihaut', 2),
    ('jackson chandler household', 'Jackson Chandler', 'jackson chandler', 1),
    ('jackson chandler household', 'Katie Chandler', 'katie chandler', 2),
    ('chase skawinski household', 'Chase Skawinski', 'chase skawinski', 1),
    ('chase skawinski household', 'Liz McKittrick', 'liz mckittrick', 2),
    ('landen eagen household', 'Landen Eagen', 'landen eagen', 1),
    ('cameron warder household', 'Cameron Warder', 'cameron warder', 1),
    ('cameron warder household', 'Madison Ruder', 'madison ruder', 2),
    ('gabe ort household', 'Gabe Ort', 'gabe ort', 1),
    ('gabe ort household', 'Rashi Ghosh', 'rashi ghosh', 2),
    ('peter bransgaard household', 'Peter Bransgaard', 'peter bransgaard', 1),
    ('peter bransgaard household', 'Grace Geist', 'grace geist', 2),
    ('ole bransgaard household', 'Ole Bransgaard', 'ole bransgaard', 1),
    ('jordan arneson household', 'Jordan Arneson', 'jordan arneson', 1),
    ('jordan arneson household', 'Emily Kiefat', 'emily kiefat', 2),
    ('nick tucker household', 'Nick Tucker', 'nick tucker', 1),
    ('nick tucker household', 'Nick Tucker +1', 'nick tucker +1', 2),
    ('matt maxwell household', 'Matt Maxwell', 'matt maxwell', 1),
    ('matt maxwell household', 'Camille Papelera', 'camille papelera', 2),
    ('jimmy patterson household', 'Jimmy Patterson', 'jimmy patterson', 1),
    ('jimmy patterson household', 'Ga''Nea Jones', 'ga''nea jones', 2),
    ('joey trom household', 'Joey Trom', 'joey trom', 1),
    ('joey trom household', 'Cassidy McManus', 'cassidy mcmanus', 2),
    ('john hansen household', 'John Hansen', 'john hansen', 1),
    ('nick richman household', 'Nick Richman', 'nick richman', 1),
    ('emma buckley household', 'Emma Buckley', 'emma buckley', 1),
    ('katarina peterson household', 'Katarina Peterson', 'katarina peterson', 1),
    ('nick trunko household', 'Nick Trunko', 'nick trunko', 1),
    ('matt trunko household', 'Matt Trunko', 'matt trunko', 1),
    ('grease household', 'Grease', 'grease', 1),
    ('nick o''gorman household', 'Nick O''Gorman', 'nick o''gorman', 1),
    ('nick o''gorman household', 'Nick O''Gorman +1', 'nick o''gorman +1', 2),
    ('josh westbrook household', 'Josh Westbrook', 'josh westbrook', 1),
    ('josh westbrook household', 'Haley Westbrook', 'haley westbrook', 2),
    ('joshua coulson household', 'Joshua Coulson', 'joshua coulson', 1),
    ('joshua coulson household', 'Kimberly', 'kimberly', 2),
    ('dan flores household', 'Dan Flores', 'dan flores', 1),
    ('dan flores household', 'Grace Stonner', 'grace stonner', 2),
    ('isaiah nicolai household', 'Isaiah Nicolai', 'isaiah nicolai', 1),
    ('isaiah nicolai household', 'Brie Nicolai', 'brie nicolai', 2),
    ('alex larios household', 'Alex Larios', 'alex larios', 1),
    ('alex larios household', 'Cydney Ferguson', 'cydney ferguson', 2),
    ('aldo tuccillo household', 'Aldo Tuccillo', 'aldo tuccillo', 1),
    ('aldo tuccillo household', 'Ronnie Tuccillo', 'ronnie tuccillo', 2),
    ('billy donley household', 'Billy Donley', 'billy donley', 1),
    ('billy donley household', 'Rachel Thomas', 'rachel thomas', 2),
    ('richard oman household', 'Richard Oman', 'richard oman', 1),
    ('richard oman household', 'Michelle', 'michelle', 2),
    ('ben thornberry household', 'Ben Thornberry', 'ben thornberry', 1),
    ('ben thornberry household', 'Serenity', 'serenity', 2),
    ('jacob darbyshire household', 'Jacob Darbyshire', 'jacob darbyshire', 1),
    ('jacob darbyshire household', 'Mackenzie Darbyshire', 'mackenzie darbyshire', 2),
    ('jacob darbyshire household', 'Jacob Darbyshire Guest 1', 'jacob darbyshire guest 1', 3),
    ('jacob darbyshire household', 'Jacob Darbyshire Guest 2', 'jacob darbyshire guest 2', 4),
    ('jason lohe household', 'Jason Lohe', 'jason lohe', 1),
    ('hahn lee household', 'Hahn Lee', 'hahn lee', 1),
    ('nick chapkey household', 'Nick Chapkey', 'nick chapkey', 1),
    ('sam starke household', 'Sam Starke', 'sam starke', 1),
    ('sam starke household', 'Katie', 'katie', 2),
    ('celebelian household', 'Celebelian', 'celebelian', 1),
    ('aaron ork household', 'Aaron Ork', 'aaron ork', 1),
    ('aaron ork household', 'Aaron Ork Guest 1', 'aaron ork guest 1', 2),
    ('aaron ork household', 'Aaron Ork Guest 2', 'aaron ork guest 2', 3),
    ('aaron ork household', 'Aaron Ork Guest 3', 'aaron ork guest 3', 4),
    ('joe tam household', 'Joe Tam', 'joe tam', 1),
    ('jeff naeger household', 'Jeff Naeger', 'jeff naeger', 1),
    ('craig naeger household', 'Craig Naeger', 'craig naeger', 1),
    ('candice cahill household', 'Candice Cahill', 'candice cahill', 1),
    ('candice cahill household', 'Tom Lux', 'tom lux', 2),
    ('shawn robinson household', 'Shawn Robinson', 'shawn robinson', 1),
    ('shawn robinson household', 'Shawn Robinson +1', 'shawn robinson +1', 2),
    ('brian robinson household', 'Brian Robinson', 'brian robinson', 1),
    ('brian robinson household', 'Donniel Robinson', 'donniel robinson', 2),
    ('kelly emanuel household', 'Kelly Emanuel', 'kelly emanuel', 1),
    ('kelly emanuel household', 'Itoro Emanuel', 'itoro emanuel', 2),
    ('anna dimaano household', 'Anna Dimaano', 'anna dimaano', 1),
    ('anna dimaano household', 'Romina', 'romina', 2),
    ('anna dimaano household', 'Giovanni', 'giovanni', 3),
    ('rommel dimaano household', 'Rommel Dimaano', 'rommel dimaano', 1),
    ('rommel dimaano household', 'Rommel Dimaano +1', 'rommel dimaano +1', 2),
    ('rommel dimaano household', 'Rommel Dimaano +2', 'rommel dimaano +2', 3),
    ('steve melody household', 'Steve Melody', 'steve melody', 1),
    ('steve melody household', 'Paula Melody', 'paula melody', 2),
    ('meredith melody-hubbell household', 'Meredith Melody-Hubbell', 'meredith melody-hubbell', 1),
    ('meredith melody-hubbell household', 'Meredith Melody-Hubbell Guest 1', 'meredith melody-hubbell guest 1', 2),
    ('meredith melody-hubbell household', 'Meredith Melody-Hubbell Guest 2', 'meredith melody-hubbell guest 2', 3),
    ('meredith melody-hubbell household', 'Meredith Melody-Hubbell Guest 3', 'meredith melody-hubbell guest 3', 4),
    ('debbie bondurant household', 'Debbie Bondurant', 'debbie bondurant', 1),
    ('daniel bondurant household', 'Daniel Bondurant', 'daniel bondurant', 1),
    ('daniel bondurant household', 'Daniel Bondurant +1', 'daniel bondurant +1', 2),
    ('issac bondurant household', 'Issac Bondurant', 'issac bondurant', 1),
    ('issac bondurant household', 'Issac Bondurant Guest 1', 'issac bondurant guest 1', 2),
    ('issac bondurant household', 'Issac Bondurant Guest 2', 'issac bondurant guest 2', 3),
    ('issac bondurant household', 'Issac Bondurant Guest 3', 'issac bondurant guest 3', 4),
    ('issac bondurant household', 'Issac Bondurant Guest 4', 'issac bondurant guest 4', 5),
    ('hannah bondurant household', 'Hannah Bondurant', 'hannah bondurant', 1),
    ('hannah bondurant household', 'Hannah Bondurant +1', 'hannah bondurant +1', 2),
    ('joanna wilson household', 'Joanna Wilson', 'joanna wilson', 1),
    ('steve birmingham household', 'Steve Birmingham', 'steve birmingham', 1),
    ('steve birmingham household', 'Alicia Birmingham', 'alicia birmingham', 2),
    ('connie estorninos household', 'Connie Estorninos', 'connie estorninos', 1),
    ('connie estorninos household', 'June Estorninos', 'june estorninos', 2),
    ('ben gliedt household', 'Ben Gliedt', 'ben gliedt', 1),
    ('ben gliedt household', 'Camilla Siudyla', 'camilla siudyla', 2)
) as guests(normalized_household_name, guest_name, normalized_guest_name, sort_order)
  on guests.normalized_household_name = h.normalized_household_name
where not exists (
  select 1
  from public.rsvp_guests g
  where g.household_id = h.id and g.guest_name = guests.guest_name
);

update public.rsvp_guests g
set sort_order = canonical.sort_order
from public.rsvp_households h
join (
  values
    ('celebelian household', 'celebelian', 1),
    ('aaron ork household', 'aaron ork', 1),
    ('aaron ork household', 'aaron ork guest 1', 2),
    ('aaron ork household', 'aaron ork guest 2', 3),
    ('aaron ork household', 'aaron ork guest 3', 4)
) as canonical(normalized_household_name, normalized_guest_name, sort_order)
  on canonical.normalized_household_name = h.normalized_household_name
where g.household_id = h.id
  and g.normalized_guest_name = canonical.normalized_guest_name
  and g.sort_order <> canonical.sort_order;

delete from public.rsvp_guests g
using public.rsvp_households h
where g.household_id = h.id
  and h.normalized_household_name = 'celebelian household'
  and g.normalized_guest_name in (
    'aaron ork',
    'aaron ork guest 1',
    'aaron ork guest 2',
    'aaron ork guest 3'
  );
