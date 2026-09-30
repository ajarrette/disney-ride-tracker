begin;

update public.rides
set
  background_path = 'disneyland/rides/mark-twain-riverboat-background.jpg',
  logo_path = 'disneyland/rides/mark-twain-riverboat-logo.jpg'
where id = 'disneyland-park-mark-twain-riverboat';

update public.rides
set
  background_path = 'disneyland/rides/disneyland-monorail-background.jpg',
  logo_path = 'disneyland/rides/disneyland-monorail-logo.jpg'
where id = 'disneyland-park-disneyland-monorail';

update public.rides
set
  background_path = 'disneyland/rides/star-wars-rise-of-the-resistance-background.jpg',
  logo_path = 'disneyland/rides/star-wars-rise-of-the-resistance-logo.jpg'
where id = 'disneyland-park-star-wars-rise-of-the-resistance';

update public.rides
set
  background_path = 'disneyland/rides/disneyland-railroad-background.jpg',
  logo_path = 'disneyland/rides/disneyland-railroad-logo.jpg'
where id = 'disneyland-park-disneyland-railroad';

commit;