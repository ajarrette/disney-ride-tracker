begin;

update public.rides as rides
set background_path = images.background_path
from (
  values
    ('disneyland-park-alice-in-wonderland', 'disneyland/rides/alice-in-wonderland-background.jpg'),
    ('disneyland-park-astro-orbitor', 'disneyland/rides/astro-orbitor-background.jpg'),
    ('disneyland-park-autopia', 'disneyland/rides/autopia-background.jpg'),
    ('disneyland-park-buzz-lightyear-astro-blasters', 'disneyland/rides/buzz-lightyear-astro-blasters-background.jpg'),
    ('disneyland-park-casey-jr-circus-train', 'disneyland/rides/casey-jr-circus-train-background.jpg'),
    ('disneyland-park-chip-n-dales-gadgetcoaster', 'disneyland/rides/chip-n-dales-gadgetcoaster-background.jpg'),
    ('disneyland-park-davy-crocketts-explorer-canoes', 'disneyland/rides/davy-crocketts-explorer-canoes-background.jpg'),
    ('disneyland-park-dumbo-the-flying-elephant', 'disneyland/rides/dumbo-the-flying-elephant-background.jpg'),
    ('disneyland-park-finding-nemo-submarine-voyage', 'disneyland/rides/finding-nemo-submarine-voyage-background.jpg'),
    ('disneyland-park-haunted-mansion', 'disneyland/rides/haunted-mansion-background.jpg'),
    ('disneyland-park-its-a-small-world', 'disneyland/rides/its-a-small-world-background.jpg'),
    ('disneyland-park-jungle-cruise', 'disneyland/rides/jungle-cruise-background.jpg'),
    ('disneyland-park-king-arthur-carrousel', 'disneyland/rides/king-arthur-carrousel-background.jpg'),
    ('disneyland-park-mad-tea-party', 'disneyland/rides/mad-tea-party-background.jpg'),
    ('disneyland-park-millennium-falcon-smugglers-run', 'disneyland/rides/millennium-falcon-smugglers-run-background.jpg'),
    ('disneyland-park-mickey-minnies-runaway-railway', 'disneyland/rides/mickey-minnies-runaway-railway-background.jpg'),
    ('disneyland-park-mr-toads-wild-ride', 'disneyland/rides/mr-toads-wild-ride-background.jpg'),
    ('disneyland-park-peter-pans-flight', 'disneyland/rides/peter-pans-flight-background.jpg'),
    ('disneyland-park-pinocchios-daring-journey', 'disneyland/rides/pinocchios-daring-journey-background.jpg'),
    ('disneyland-park-pirates-of-the-caribbean', 'disneyland/rides/pirates-of-the-caribbean-background.jpg'),
    ('disneyland-park-roger-rabbits-car-toon-spin', 'disneyland/rides/roger-rabbits-car-toon-spin-background.jpg'),
    ('disneyland-park-snow-whites-enchanted-wish', 'disneyland/rides/snow-whites-enchanted-wish-background.jpg'),
    ('disneyland-park-star-tours-adventures-continue', 'disneyland/rides/star-tours-adventures-continue-background.jpg'),
    ('disneyland-park-storybook-land-canal-boats', 'disneyland/rides/storybook-land-canal-boats-background.jpg'),
    ('disneyland-park-tianas-bayou-adventure', 'disneyland/rides/tianas-bayou-adventure-background.jpg'),
    ('disneyland-park-many-adventures-of-winnie-the-pooh', 'disneyland/rides/many-adventures-of-winnie-the-pooh-background.jpg'),
    ('california-adventure-luigis-rollickin-roadsters', 'california-adventure/rides/luigis-rollickin-roadsters-background.jpg'),
    ('california-adventure-maters-junkyard-jamboree', 'california-adventure/rides/maters-junkyard-jamboree-background.jpg'),
    ('california-adventure-monsters-inc-mikes-sulley-to-the-rescue', 'california-adventure/rides/monsters-inc-mikes-sulley-to-the-rescue-background.jpg'),
    ('california-adventure-soarin-across-america', 'california-adventure/rides/soarin-across-america-background.jpg'),
    ('california-adventure-toy-story-midway-mania', 'california-adventure/rides/toy-story-midway-mania-background.jpg'),
    ('california-adventure-web-slingers-spider-man-adventure', 'california-adventure/rides/web-slingers-spider-man-adventure-background.jpg'),
    ('california-adventure-golden-zephyr', 'california-adventure/rides/golden-zephyr-background.jpg'),
    ('california-adventure-goofys-sky-school', 'california-adventure/rides/goofys-sky-school-background.jpg'),
    ('california-adventure-inside-out-emotional-whirlwind', 'california-adventure/rides/inside-out-emotional-whirlwind-background.jpg'),
    ('california-adventure-jessies-critter-carousel', 'california-adventure/rides/jessies-critter-carousel-background.jpg'),
    ('california-adventure-jumpin-jellyfish', 'california-adventure/rides/jumpin-jellyfish-background.jpg'),
    ('california-adventure-little-mermaid-ariels-undersea-adventure', 'california-adventure/rides/little-mermaid-ariels-undersea-adventure-background.jpg'),
    ('california-adventure-pixar-pal-a-round', 'california-adventure/rides/pixar-pal-a-round-background.jpg'),
    ('california-adventure-silly-symphony-swings', 'california-adventure/rides/silly-symphony-swings-background.jpg')
) as images(id, background_path)
where rides.id = images.id;

commit;