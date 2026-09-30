begin;

insert into public.rides (
  id,
  themeparks_entity_id,
  name,
  park,
  land,
  attraction_type,
  minimum_height_inches,
  ages,
  description,
  official_url
)
values
  (
    'disneyland-park-mark-twain-riverboat',
    '6c30d5b0-8c0a-406f-9258-0b6c55d4a5e4',
    'Mark Twain Riverboat',
    'disneyland_park',
    'frontierland',
    'transportation',
    null,
    array['all_ages']::text[],
    'Cruise the Rivers of America aboard a classic paddle-wheel riverboat.',
    'https://disneyland.disney.go.com/attractions/disneyland/mark-twain-riverboat/'
  ),
  (
    'disneyland-park-disneyland-monorail',
    '56d0bd6d-5106-4420-8f60-0005475c04c3',
    'Disneyland Monorail',
    'disneyland_park',
    'tomorrowland',
    'transportation',
    null,
    array['all_ages']::text[],
    'Ride above the resort aboard a high-speed monorail system.',
    'https://disneyland.disney.go.com/attractions/disneyland/disneyland-monorail/'
  ),
  (
    'disneyland-park-star-wars-rise-of-the-resistance',
    '34b1d70f-11c4-42df-935e-d5582c9f1a8e',
    'Star Wars: Rise of the Resistance',
    'disneyland_park',
    'star_wars_galaxys_edge',
    'ride',
    40,
    array['all_ages']::text[],
    'Join the Resistance in an immersive mission against the First Order.',
    'https://disneyland.disney.go.com/attractions/disneyland/star-wars-rise-of-the-resistance/'
  ),
  (
    'disneyland-park-disneyland-railroad',
    'e2d460e9-2bef-4613-b126-092ab7cb37e5',
    'Disneyland Railroad',
    'disneyland_park',
    'main_street_usa',
    'transportation',
    null,
    array['all_ages']::text[],
    'Circle Disneyland Park aboard a classic steam-powered train.',
    'https://disneyland.disney.go.com/attractions/disneyland/disneyland-railroad/'
  );

commit;