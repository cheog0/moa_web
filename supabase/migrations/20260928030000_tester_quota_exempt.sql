-- Temporary tester quota exemption (app reads this RPC directly).
-- Testers can record/process without the monthly 30-minute cap.
create or replace function public.get_free_usage_for_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_sec int := 1800;
  used int;
  tester_limit int := 86400; -- 24h, matches app remainingSeconds clamp
begin
  if p_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Tester accounts for internal QA.
  if p_user_id in (
    'c3795da3-4ae6-4484-b54c-904dc794562b'::uuid,
    'c83dfbb8-c150-4ba8-a1de-cd552dbf2c6a'::uuid
  ) then
    return jsonb_build_object(
      'success', true,
      'plan', 'tester',
      'limit_seconds', tester_limit,
      'used_seconds', 0,
      'remaining_seconds', tester_limit
    );
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

  -- Tester accounts: do not burn the free ledger.
  if p_user_id in (
    'c3795da3-4ae6-4484-b54c-904dc794562b'::uuid,
    'c83dfbb8-c150-4ba8-a1de-cd552dbf2c6a'::uuid
  ) then
    return public.get_free_usage_for_user(p_user_id);
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
