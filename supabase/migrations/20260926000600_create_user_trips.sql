create table public.user_trips (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null check (length(trim(name)) > 0),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  check (start_date <= end_date)
);

create trigger user_trips_set_updated_at
before update on public.user_trips
for each row execute function public.set_updated_at();

alter table public.user_trips enable row level security;
revoke all on table public.user_trips from anon, authenticated;
grant select, insert, update on table public.user_trips to authenticated;

create policy "Users can read their trips"
on public.user_trips
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their trips"
on public.user_trips
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their trips"
on public.user_trips
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter table public.ride_logs
add constraint ride_logs_user_trip_fk
foreign key (user_id, trip_id)
references public.user_trips (user_id, id);