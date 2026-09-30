begin;

update public.rides
set
  background_path = 'https://cdn1.parksmedia.wdprapps.disney.com/resize/mwImage/1/630/354/75/vision-dam/digital/parks-platform/parks-global-assets/disney-world/attractions/zootopia-better-zoogether/4853600_Zootopia_BETTER_TOGETHER_Key_Visual_jrod_16x9-16x9.jpg?2025-10-16T18:59:45+00:00',
  official_url = 'https://disneyworld.disney.go.com/attractions/animal-kingdom/zootopia-better-zoogether/'
where id = 'animal-kingdom-zootopia-better-zoogether';

commit;