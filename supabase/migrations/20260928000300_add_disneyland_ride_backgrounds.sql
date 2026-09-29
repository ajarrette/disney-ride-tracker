begin;

update public.rides as rides
set background_path = images.background_path
from (
  values
    ('disneyland-park-space-mountain', 'disneyland/rides/space-mountain-background.jpg'),
    ('disneyland-park-matterhorn-bobsleds', 'disneyland/rides/matterhorn-bobsleds-background.jpg'),
    ('disneyland-park-indiana-jones-adventure', 'disneyland/rides/indiana-jones-adventure-background.jpg'),
    ('disneyland-park-big-thunder-mountain-railroad', 'disneyland/rides/big-thunder-mountain-railroad-background.jpg')
) as images(id, background_path)
where rides.id = images.id;

commit;