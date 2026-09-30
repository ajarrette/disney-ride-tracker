begin;

update public.rides
set
  background_path = 'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/dam/wdpro-assets/gallery/attractions/animal-kingdom/maharajah-jungle-trek/maharajah-jungle-trek-gallery01.jpg?1699632720790',
  logo_path = 'animal-kingdom/rides/maharajah-jungle-trek-logo.jpg',
  official_url = 'https://disneyworld.disney.go.com/attractions/animal-kingdom/maharajah-jungle-trek/'
where id = 'animal-kingdom-maharajah-jungle-trek';

update public.rides
set
  background_path = 'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/vision-dam/digital/parks-platform/parks-global-assets/disney-world/attractions/gorilla-falls-exploration-trail/DAK22-Gorillas0223-4909-16x9.jpg?2025-09-18T20:33:45+00:00',
  logo_path = 'animal-kingdom/rides/gorilla-falls-exploration-trail-logo.jpg',
  official_url = 'https://disneyworld.disney.go.com/attractions/animal-kingdom/gorilla-falls-forest-exploration-trail/'
where id = 'animal-kingdom-gorilla-falls-exploration-trail';

commit;