begin;

update public.rides as rides
set logo_path = images.logo_path
from (
  values
    (
      'magic-kingdom-swiss-family-treehouse',
      'magic-kingdom/rides/swiss-family-treehouse-logo.jpg'
    ),
    (
      'magic-kingdom-mickeys-philharmagic',
      'magic-kingdom/rides/mickeys-philharmagic-logo.jpg'
    ),
    (
      'magic-kingdom-walt-disneys-enchanted-tiki-room',
      'magic-kingdom/rides/walt-disneys-enchanted-tiki-room-logo.jpg'
    ),
    (
      'magic-kingdom-enchanted-tales-with-belle',
      'magic-kingdom/rides/enchanted-tales-with-belle-logo.jpg'
    ),
    (
      'magic-kingdom-country-bear-musical-jamboree',
      'magic-kingdom/rides/country-bear-musical-jamboree-logo.jpg'
    ),
    (
      'magic-kingdom-hall-of-presidents',
      'magic-kingdom/rides/hall-of-presidents-logo.jpg'
    )
) as images(id, logo_path)
where rides.id = images.id;

commit;