begin;

update public.rides as rides
set background_path = images.background_path
from (
  values
    ('california-adventure-radiator-springs-racers', 'california-adventure/rides/radiator-springs-racers-background.jpg'),
    ('california-adventure-incredicoaster', 'california-adventure/rides/incredicoaster-background.jpg'),
    ('california-adventure-grizzly-river-run', 'california-adventure/rides/grizzly-river-run-background.jpg'),
    ('california-adventure-guardians-mission-breakout', 'california-adventure/rides/guardians-mission-breakout-background.jpg')
) as images(id, background_path)
where rides.id = images.id;

commit;