begin;

insert into public.rides (
  id,
  themeparks_entity_id,
  name,
  park,
  land,
  attraction_type,
  ages,
  description,
  official_url
)
values
  (
    'animal-kingdom-gorilla-falls-exploration-trail',
    'e7976e25-4322-4587-8ded-fb1d9dcbb83c',
    'Gorilla Falls Exploration Trail',
    'animal_kingdom',
    'africa',
    'experience',
    array['all_ages']::text[],
    'Explore a lush walking trail to observe gorillas and other African wildlife.',
    'https://disneyworld.disney.go.com/attractions/animal-kingdom/gorilla-falls-exploration-trail/'
  ),
  (
    'animal-kingdom-zootopia-better-zoogether',
    '1b15c77b-0311-4171-8e59-7f38e6d60754',
    'Zootopia: Better Zoogether!',
    'animal_kingdom',
    'discovery_island',
    'show',
    array['all_ages']::text[],
    'Join Judy Hopps and Nick Wilde for a 4D adventure through the biomes of Zootopia.',
    null
  ),
  (
    'animal-kingdom-maharajah-jungle-trek',
    '1a8ea967-229a-42a0-8290-59b036c84e14',
    'Maharajah Jungle Trek',
    'animal_kingdom',
    'asia',
    'experience',
    array['all_ages']::text[],
    'Wander the Anandapur Royal Forest to discover tigers, bats, birds, and other wildlife.',
    'https://disneyworld.disney.go.com/attractions/animal-kingdom/maharajah-jungle-trek/'
  );

commit;