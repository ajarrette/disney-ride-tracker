create table public.user_ride_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  ride_id text not null references public.rides(id) on delete cascade,
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, ride_id)
);

create trigger user_ride_preferences_set_updated_at
before update on public.user_ride_preferences
for each row execute function public.set_updated_at();

alter table public.user_ride_preferences enable row level security;
revoke all on table public.user_ride_preferences from anon, authenticated;
grant select, insert, update, delete
  on table public.user_ride_preferences to authenticated;

create policy "Users can read their ride preferences"
on public.user_ride_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their ride preferences"
on public.user_ride_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their ride preferences"
on public.user_ride_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their ride preferences"
on public.user_ride_preferences
for delete
to authenticated
using ((select auth.uid()) = user_id);