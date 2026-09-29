begin;

update public.rides as rides
set background_path = images.background_path
from (
  values
    (
      'magic-kingdom-swiss-family-treehouse',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/parks-and-tickets/attractions/magic-kingdom/swiss-family-treehouse/swiss-family-treehouse-00.jpg?1778613900986'
    ),
    (
      'magic-kingdom-mickeys-philharmagic',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/parks-and-tickets/attractions/magic-kingdom/mickeys-philharmagic/mickeys-philharmagic-00.jpg?1779823677395'
    ),
    (
      'magic-kingdom-walt-disneys-enchanted-tiki-room',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/parks-and-tickets/attractions/magic-kingdom/walt-disneys-enchanted-tiki-room/enchanted-tiki-room-00.jpg?1779734610179'
    ),
    (
      'magic-kingdom-enchanted-tales-with-belle',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/disney-world/attractions/magic-kingdom/enchanted-tales-with-belle/mk-belle-enchanted-tales-meet-16x9.jpg?1699632695966'
    ),
    (
      'magic-kingdom-country-bear-musical-jamboree',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/vision-dam/digital/parks-platform/parks-global-assets/disney-world/attractions/country-bear-jamboree/240824WS-_6849-1-16x9-16x9.jpg?2025-09-17T20:01:11+00:00'
    ),
    (
      'magic-kingdom-hall-of-presidents',
      'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/parks-and-tickets/attractions/magic-kingdom/the-hall-of-presidents/hall-of-presidents-04.jpg?1788455771638'
    )
) as images(id, background_path)
where rides.id = images.id;

commit;