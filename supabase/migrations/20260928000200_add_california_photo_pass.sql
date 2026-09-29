begin;

update public.rides
set photo_pass = true
where id in (
  'disneyland-park-space-mountain',
  'california-adventure-guardians-mission-breakout',
  'california-adventure-incredicoaster',
  'california-adventure-radiator-springs-racers'
)
and park in ('disneyland_park', 'disney_california_adventure');

commit;