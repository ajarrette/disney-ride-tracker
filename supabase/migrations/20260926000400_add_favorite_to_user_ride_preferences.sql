alter table public.user_ride_preferences
add column if not exists is_favorite boolean not null default false;