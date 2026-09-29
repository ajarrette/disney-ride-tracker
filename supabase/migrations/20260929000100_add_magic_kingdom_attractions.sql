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
    'magic-kingdom-swiss-family-treehouse',
    '30fe3c64-af71-4c66-a54b-aa61fd7af177',
    'Swiss Family Treehouse',
    'magic_kingdom',
    'adventureland',
    'ride',
    array['all_ages']::text[],
    'Climb through a multi-level treehouse inspired by the Swiss Family Robinson.'
  ),
  (
    'magic-kingdom-mickeys-philharmagic',
    '7c5e1e02-3a44-4151-9005-44066d5ba1da',
    'Mickey''s PhilharMagic',
    'magic_kingdom',
    'fantasyland',
    'show',
    array['all_ages']::text[],
    'Join Donald Duck on a 3D musical journey through classic Disney films.'
  ),
  (
    'magic-kingdom-walt-disneys-enchanted-tiki-room',
    '6fd1e225-53a0-4a80-a577-4bbc9a471075',
    'Walt Disney''s Enchanted Tiki Room',
    'magic_kingdom',
    'adventureland',
    'show',
    array['all_ages']::text[],
    'Enjoy a musical revue featuring Audio-Animatronics birds and tropical characters.'
  ),
  (
    'magic-kingdom-enchanted-tales-with-belle',
    'e76c93df-31af-49a5-8e2f-752c76c937c9',
    'Enchanted Tales with Belle',
    'magic_kingdom',
    'fantasyland',
    'show',
    array['all_ages']::text[],
    'Step into Belle''s story in an interactive retelling of Beauty and the Beast.'
  ),
  (
    'magic-kingdom-country-bear-musical-jamboree',
    '0f57cecf-5502-4503-8bc3-ba84d3708ace',
    'Country Bear Musical Jamboree',
    'magic_kingdom',
    'frontierland',
    'show',
    array['all_ages']::text[],
    'Watch a country-themed musical revue led by the bears.'
  ),
  (
    'magic-kingdom-hall-of-presidents',
    '2ebfb38c-5cb5-4de1-86c0-f7af14188022',
    'The Hall of Presidents',
    'magic_kingdom',
    'liberty_square',
    'show',
    array['all_ages']::text[],
    'Experience a presentation on the history of the American presidency.'
  );