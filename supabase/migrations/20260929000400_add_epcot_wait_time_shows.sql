begin;

insert into public.rides (
  id,
  themeparks_entity_id,
  name,
  park,
  land,
  attraction_type,
  ages,
  description
)
values
  (
    'epcot-canada-far-and-wide',
    '61fb49f8-e62f-4e1c-ae0e-8ab9929037bc',
    'Canada Far and Wide in Circle-Vision 360',
    'epcot',
    'world_showcase',
    'show',
    array['all_ages']::text[],
    'Explore Canada through a 360-degree film presentation.'
  ),
  (
    'epcot-impressions-de-france',
    '00666fe9-7774-4b53-9fb7-3d333f8aa503',
    'Impressions de France',
    'epcot',
    'world_showcase',
    'show',
    array['all_ages']::text[],
    'See the landscapes and landmarks of France in a panoramic film.'
  ),
  (
    'epcot-turtle-talk-with-crush',
    '57acb522-a6fc-4aa4-a80e-21f21f317250',
    'Turtle Talk With Crush',
    'epcot',
    'world_nature',
    'show',
    array['all_ages']::text[],
    'Talk with Crush in an interactive show beneath the sea.'
  ),
  (
    'epcot-reflections-of-china',
    'ee070d46-6a64-41c0-9f12-69dcfcca10a0',
    'Reflections of China',
    'epcot',
    'world_showcase',
    'show',
    array['all_ages']::text[],
    'Discover China through a Circle-Vision 360 film.'
  );

commit;