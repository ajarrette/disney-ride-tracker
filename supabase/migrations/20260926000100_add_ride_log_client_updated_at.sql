alter table public.ride_logs
add column client_updated_at timestamptz not null default now();

create or replace function public.set_ride_log_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.client_updated_at < old.client_updated_at then
    return old;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger ride_logs_set_updated_at on public.ride_logs;

create trigger ride_logs_set_updated_at
before update on public.ride_logs
for each row execute function public.set_ride_log_updated_at();