begin;

insert into public.rides (
  id,
  name,
  park,
  land,
  logo_path,
  background_path,
  attraction_type,
  duration_minutes,
  minimum_height_inches,
  maximum_height_inches,
  ages,
  thrill_types,
  accessibility,
  warnings,
  description,
  photo_pass,
  lightning_lane,
  latitude,
  longitude,
  official_url,
  seasonal,
  opening_date
)
values
  ('disneyland-park-space-mountain', 'Space Mountain', 'disneyland_park', 'tomorrowland', null, null, 'ride', null, 40, null, array['all_ages']::text[], array['thrill_ride', 'dark', 'loud']::text[], array[]::text[], array['darkness', 'loud_sounds']::text[], 'Race through the cosmos in the dark on a thrilling indoor roller coaster.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disneyland/space-mountain/', false, null),
  ('california-adventure-radiator-springs-racers', 'Radiator Springs Racers', 'disney_california_adventure', 'cars_land', null, null, 'ride', null, 40, null, array['all_ages']::text[], array['thrill_ride']::text[], array[]::text[], array[]::text[], 'Race through Ornament Valley and Radiator Springs in a high-speed road adventure.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disney-california-adventure/radiator-springs-racers/', false, null),
  ('disneyland-park-matterhorn-bobsleds', 'Matterhorn Bobsleds', 'disneyland_park', 'fantasyland', null, null, 'ride', null, 42, null, array['all_ages']::text[], array['thrill_ride', 'big_drops']::text[], array[]::text[], array['darkness', 'scary']::text[], 'Race through icy caves and around a snow-covered mountain in a high-speed bobsled.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disneyland/matterhorn-bobsleds/', false, null),
  ('disneyland-park-indiana-jones-adventure', 'Indiana Jones™ Adventure', 'disneyland_park', 'adventureland', null, null, 'ride', null, 46, null, array['all_ages']::text[], array['thrill_ride', 'dark']::text[], array[]::text[], array['darkness', 'loud_sounds']::text[], 'Explore the Temple of the Forbidden Eye aboard a rugged troop transport.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disneyland/indiana-jones-adventure/', false, null),
  ('disneyland-park-big-thunder-mountain-railroad', 'Big Thunder Mountain Railroad', 'disneyland_park', 'frontierland', null, null, 'ride', null, 40, null, array['all_ages']::text[], array['thrill_ride', 'small_drops']::text[], array[]::text[], array['darkness', 'loud_sounds']::text[], 'Race through a haunted gold mine aboard a runaway train.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disneyland/big-thunder-mountain-railroad/', false, null),
  ('california-adventure-incredicoaster', 'Incredicoaster', 'disney_california_adventure', 'pixar_pier', null, null, 'ride', null, 48, null, array['all_ages']::text[], array['thrill_ride', 'loud']::text[], array[]::text[], array['loud_sounds']::text[], 'Join the Incredibles on a high-speed coaster chase around Pixar Pier.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disney-california-adventure/incredicoaster/', false, null),
  ('california-adventure-grizzly-river-run', 'Grizzly River Run', 'disney_california_adventure', 'grizzly_peak', null, null, 'ride', null, 42, null, array['all_ages']::text[], array['thrill_ride', 'small_drops']::text[], array[]::text[], array['water']::text[], 'Descend Grizzly Peak in a circular raft on a splash-filled whitewater ride.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disney-california-adventure/grizzly-river-run/', false, null),
  ('california-adventure-guardians-mission-breakout', 'Guardians of the Galaxy - Mission: BREAKOUT!', 'disney_california_adventure', 'avengers_campus', null, null, 'ride', null, 40, null, array['all_ages']::text[], array['thrill_ride', 'big_drops', 'loud']::text[], array[]::text[], array['loud_sounds']::text[], 'Help Rocket rescue the Guardians during a high-energy mission with sudden drops.', false, true, null, null, 'https://disneyland.disney.go.com/attractions/disney-california-adventure/guardians-galaxy-mission-breakout/', false, null)
on conflict (id) do nothing;

commit;