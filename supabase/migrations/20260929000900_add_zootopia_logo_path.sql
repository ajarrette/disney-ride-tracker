begin;

update public.rides
set logo_path = 'animal-kingdom/rides/zootopia-better-zoogether-logo.jpg'
where id = 'animal-kingdom-zootopia-better-zoogether';

commit;