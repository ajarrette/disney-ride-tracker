create table public.ride_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  ride_id text not null references public.rides(id) on delete restrict,
  trip_id text,
  visited_at timestamptz not null,
  wait_time_minutes integer check (wait_time_minutes >= 0),
  lightning_lane_used boolean not null default false,
  notes text not null default '',
  photo_paths text[] not null default '{}',
  rating numeric(2, 1) check (rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index ride_logs_user_visited_at_idx
  on public.ride_logs (user_id, visited_at desc);

create trigger ride_logs_set_updated_at
before update on public.ride_logs
for each row execute function public.set_updated_at();

alter table public.ride_logs enable row level security;
revoke all on table public.ride_logs from anon, authenticated;
grant select, insert, update, delete on table public.ride_logs to authenticated;

create policy "Users can read their ride logs"
on public.ride_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their ride logs"
on public.ride_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their ride logs"
on public.ride_logs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their ride logs"
on public.ride_logs
for delete
to authenticated
using ((select auth.uid()) = user_id);