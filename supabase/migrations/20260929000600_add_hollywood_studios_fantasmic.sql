begin;

insert into public.rides (
  id,
  themeparks_entity_id,
  name,
  park,
  land,
  logo_path,
  background_path,
  attraction_type,
  duration_minutes,
  ages,
  description,
  official_url
)
values (
  'hollywood-studios-fantasmic',
  '42328c39-76ab-4f03-b862-4206c8d9f7bb',
  'Fantasmic!',
  'hollywood_studios',
  'sunset_boulevard',
  'hollywood-studios/rides/fantasmic-logo.jpg',
  'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/vision-dam/digital/parks-platform/parks-global-assets/disney-world/attractions/fantasmic/1024ZO_3792AFN_xak-16x9.jpg?2022-11-29T22:40:18+00:00',
  'show',
  30,
  array['all_ages']::text[],
  'Watch Mickey’s dream unfold in a nighttime spectacular of water, light, music, and stunts.',
  'https://disneyworld.disney.go.com/entertainment/hollywood-studios/fantasmic/'
);

commit;