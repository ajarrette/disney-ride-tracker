begin;

update public.rides
set lightning_lane = true
where park = 'disneyland_park'
  and id in (
    'disneyland-park-autopia',
    'disneyland-park-big-thunder-mountain-railroad',
    'disneyland-park-buzz-lightyear-astro-blasters',
    'disneyland-park-haunted-mansion',
    'disneyland-park-indiana-jones-adventure',
    'disneyland-park-its-a-small-world',
    'disneyland-park-matterhorn-bobsleds',
    'disneyland-park-mickey-minnies-runaway-railway',
    'disneyland-park-millennium-falcon-smugglers-run',
    'disneyland-park-roger-rabbits-car-toon-spin',
    'disneyland-park-space-mountain',
    'disneyland-park-star-tours-adventures-continue',
    'disneyland-park-tianas-bayou-adventure',
    'disneyland-park-star-wars-rise-of-the-resistance'
  );

commit;