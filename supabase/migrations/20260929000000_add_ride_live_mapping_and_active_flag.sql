alter table public.rides
  add column themeparks_entity_id text,
  add column is_active boolean not null default true;

create unique index rides_themeparks_entity_id_key
  on public.rides (themeparks_entity_id)
  where themeparks_entity_id is not null;