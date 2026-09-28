alter table public.user_ride_preferences
add column rating numeric(2, 1) check (rating between 0 and 5);