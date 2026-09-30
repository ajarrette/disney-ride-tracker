begin;

update public.rides
set lightning_lane = true
where park = 'disney_california_adventure'
  and id in (
    'california-adventure-goofys-sky-school',
    'california-adventure-grizzly-river-run',
    'california-adventure-guardians-mission-breakout',
    'california-adventure-incredicoaster',
    'california-adventure-monsters-inc-mikes-sulley-to-the-rescue',
    'california-adventure-soarin-across-america',
    'california-adventure-little-mermaid-ariels-undersea-adventure',
    'california-adventure-toy-story-midway-mania',
    'california-adventure-web-slingers-spider-man-adventure',
    'california-adventure-radiator-springs-racers'
  );

commit;