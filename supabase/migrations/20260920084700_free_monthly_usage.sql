alter table public.user_settings
  add column if not exists usage_month text,
  add column if not exists usage_seconds integer not null default 0;

create or replace function public.usage_month_kst()
returns text
language sql
stable
as $$
  select to_char(timezone('Asia/Seoul', now()), 'YYYY-MM');
$$;

create or replace function public.get_free_usage()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  month text := public.usage_month_kst();
  used int := 0;
  stored_month text;
  limit_sec int := 1800;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select usage_month, coalesce(usage_seconds, 0)
    into stored_month, used
    from public.user_settings
    where user_id = uid;

  if found and stored_month is distinct from month then
    used := 0;
    update public.user_settings
      set usage_month = month,
          usage_seconds = 0
      where user_id = uid;
  end if;

  if not found then
    used := 0;
  end if;

  return jsonb_build_object(
    'success', true,
    'plan', 'free',
    'limit_seconds', limit_sec,
    'used_seconds', used,
    'remaining_seconds', greatest(limit_sec - used, 0)
  );
end;
$$;

create or replace function public.consume_free_usage(p_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  month text := public.usage_month_kst();
  add_sec int := greatest(coalesce(p_seconds, 0), 0);
  limit_sec int := 1800;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.user_settings (user_id, ai_engine, usage_month, usage_seconds)
  values (uid, 'default', month, least(limit_sec, add_sec))
  on conflict (user_id) do update
    set usage_month = excluded.usage_month,
        usage_seconds = case
          when public.user_settings.usage_month is distinct from excluded.usage_month
            then least(limit_sec, add_sec)
          else least(limit_sec, coalesce(public.user_settings.usage_seconds, 0) + add_sec)
        end;

  return public.get_free_usage();
end;
$$;

revoke all on function public.usage_month_kst() from public;
revoke all on function public.get_free_usage() from public;
revoke all on function public.consume_free_usage(integer) from public;
grant execute on function public.get_free_usage() to authenticated;
grant execute on function public.consume_free_usage(integer) to authenticated;
