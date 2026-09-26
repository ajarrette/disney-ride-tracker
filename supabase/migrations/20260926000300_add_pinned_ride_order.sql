alter table public.user_ride_preferences
add column pinned_order integer;

with ordered_pins as (
  select
    user_id,
    ride_id,
    (row_number() over (
      partition by user_id
      order by created_at, ride_id
    ) - 1)::integer as pinned_order
  from public.user_ride_preferences
  where is_pinned
)
update public.user_ride_preferences as preferences
set pinned_order = ordered_pins.pinned_order
from ordered_pins
where preferences.user_id = ordered_pins.user_id
  and preferences.ride_id = ordered_pins.ride_id;

alter table public.user_ride_preferences
add constraint user_ride_preferences_pinned_order_consistency
check (
  (is_pinned and pinned_order is not null and pinned_order >= 0)
  or (not is_pinned and pinned_order is null)
);

create or replace function public.save_pinned_ride_order(p_ride_ids text[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in to save ride preferences.';
  end if;

  update public.user_ride_preferences
  set is_pinned = false, pinned_order = null
  where user_id = auth.uid()
    and is_pinned
    and not (ride_id = any(coalesce(p_ride_ids, '{}'::text[])));

  insert into public.user_ride_preferences (
    user_id,
    ride_id,
    is_pinned,
    pinned_order
  )
  select
    auth.uid(),
    pinned.ride_id,
    true,
    (pinned.ordinality - 1)::integer
  from unnest(coalesce(p_ride_ids, '{}'::text[])) with ordinality
    as pinned(ride_id, ordinality)
  on conflict (user_id, ride_id) do update
  set is_pinned = excluded.is_pinned,
      pinned_order = excluded.pinned_order;
end;
$$;

revoke all on function public.save_pinned_ride_order(text[]) from public, anon;
grant execute on function public.save_pinned_ride_order(text[]) to authenticated;