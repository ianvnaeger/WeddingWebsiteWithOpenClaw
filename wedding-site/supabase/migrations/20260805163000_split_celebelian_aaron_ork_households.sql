begin;

do $$
declare
  celeb_household_id uuid;
  aaron_household_id uuid;
begin
  select id
  into celeb_household_id
  from public.rsvp_households
  where normalized_household_name = 'celebelian household';

  if celeb_household_id is null then
    raise exception 'Could not find Celebelian household.';
  end if;

  insert into public.rsvp_households (household_name, normalized_household_name)
  values ('Aaron Ork household', 'aaron ork household')
  on conflict (normalized_household_name) do update
    set household_name = excluded.household_name;

  select id
  into aaron_household_id
  from public.rsvp_households
  where normalized_household_name = 'aaron ork household';

  if exists (
    select 1
    from public.rsvp_submissions s
    join public.rsvp_guest_responses r on r.submission_id = s.id
    join public.rsvp_guests g on g.id = r.guest_id
    where s.household_id = celeb_household_id
    group by s.id
    having bool_or(g.normalized_guest_name = 'celebelian')
       and bool_or(g.normalized_guest_name like 'aaron ork%')
  ) then
    raise exception 'Found a mixed Celebelian/Aaron Ork submission. Aborting to preserve RSVP history.';
  end if;

  update public.rsvp_submissions s
  set household_id = aaron_household_id,
      submitted_household_name = 'Aaron Ork household'
  where s.household_id = celeb_household_id
    and exists (
      select 1
      from public.rsvp_guest_responses r
      join public.rsvp_guests g on g.id = r.guest_id
      where r.submission_id = s.id
        and g.normalized_guest_name like 'aaron ork%'
    )
    and not exists (
      select 1
      from public.rsvp_guest_responses r
      join public.rsvp_guests g on g.id = r.guest_id
      where r.submission_id = s.id
        and g.normalized_guest_name = 'celebelian'
    );

  insert into public.rsvp_guests (household_id, guest_name, normalized_guest_name, sort_order)
  values
    (aaron_household_id, 'Aaron Ork', 'aaron ork', 1),
    (aaron_household_id, 'Aaron Ork Guest 1', 'aaron ork guest 1', 2),
    (aaron_household_id, 'Aaron Ork Guest 2', 'aaron ork guest 2', 3),
    (aaron_household_id, 'Aaron Ork Guest 3', 'aaron ork guest 3', 4)
  on conflict do nothing;

  update public.rsvp_guests dst
  set guest_name = src.guest_name,
      sort_order = src.sort_order
  from (
    values
      ('aaron ork', 'Aaron Ork', 1),
      ('aaron ork guest 1', 'Aaron Ork Guest 1', 2),
      ('aaron ork guest 2', 'Aaron Ork Guest 2', 3),
      ('aaron ork guest 3', 'Aaron Ork Guest 3', 4)
  ) as src(normalized_guest_name, guest_name, sort_order)
  where dst.household_id = aaron_household_id
    and dst.normalized_guest_name = src.normalized_guest_name;

  update public.rsvp_guests dst
  set household_id = aaron_household_id
  from (
    select id, normalized_guest_name
    from public.rsvp_guests
    where household_id = celeb_household_id
      and normalized_guest_name like 'aaron ork%'
  ) as src
  where dst.id = src.id
    and not exists (
      select 1
      from public.rsvp_guests existing
      where existing.household_id = aaron_household_id
        and existing.normalized_guest_name = src.normalized_guest_name
    );

  delete from public.rsvp_guests
  where household_id = celeb_household_id
    and normalized_guest_name like 'aaron ork%';

  update public.rsvp_guests
  set sort_order = 1
  where household_id = celeb_household_id
    and normalized_guest_name = 'celebelian';
end $$;

commit;
