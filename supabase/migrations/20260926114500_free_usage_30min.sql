-- Raise free monthly usage limit from 5 minutes back to 30 minutes.
create or replace function public.get_free_usage_for_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_sec int := 1800;
  used int;
begin
  if p_user_id is null then
    raise exception 'not authenticated';
  end if;

  used := public.stamp_free_usage_for_user(p_user_id);

  return jsonb_build_object(
    'success', true,
    'plan', 'free',
    'limit_seconds', limit_sec,
    'used_seconds', used,
    'remaining_seconds', greatest(limit_sec - used, 0)
  );
end;
$$;

create or replace function public.consume_free_usage_for_user(p_user_id uuid, p_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  month text := public.usage_month_kst();
  keys text[] := public.free_usage_identity_keys(p_user_id);
  add_sec int := greatest(coalesce(p_seconds, 0), 0);
  limit_sec int := 1800;
  used int;
  k text;
begin
  if p_user_id is null then
    raise exception 'not authenticated';
  end if;

  used := least(limit_sec, public._current_free_used_seconds(p_user_id) + add_sec);

  foreach k in array keys loop
    insert into public.free_usage_identities (identity_key, usage_month, used_seconds, updated_at)
    values (k, month, used, now())
    on conflict (identity_key, usage_month) do update
      set used_seconds = greatest(public.free_usage_identities.used_seconds, excluded.used_seconds),
          updated_at = now();
  end loop;

  insert into public.user_settings (user_id, ai_engine, usage_month, usage_seconds)
  values (p_user_id, 'default', month, used)
  on conflict (user_id) do update
    set usage_month = excluded.usage_month,
        usage_seconds = excluded.usage_seconds;

  return public.get_free_usage_for_user(p_user_id);
end;
$$;
