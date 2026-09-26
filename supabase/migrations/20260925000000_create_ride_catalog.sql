create table public.rides (
  id text primary key,
  name text not null,
  park text not null,
  land text not null,
  logo_path text,
  background_path text,
  attraction_type text not null,
  duration_minutes integer,
  minimum_height_inches integer,
  maximum_height_inches integer,
  ages text[] not null default '{}',
  thrill_types text[] not null default '{}',
  accessibility text[] not null default '{}',
  warnings text[] not null default '{}',
  description text not null default '',
  photo_pass boolean not null default false,
  lightning_lane boolean not null default false,
  latitude double precision,
  longitude double precision,
  official_url text,
  seasonal boolean not null default false,
  opening_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rides_park_name_idx on public.rides (park, name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rides_set_updated_at
before update on public.rides
for each row execute function public.set_updated_at();

alter table public.rides enable row level security;
revoke all on table public.rides from anon, authenticated;
grant select on table public.rides to anon, authenticated;

create policy "Anyone can read rides"
on public.rides
for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('ride-images', 'ride-images', true)
on conflict (id) do update set public = excluded.public;

create policy "Anyone can read ride images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'ride-images');