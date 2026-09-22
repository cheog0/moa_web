create extension if not exists pgcrypto;

create table if not exists public.free_usage_identities (
  identity_key text not null,
  usage_month text not null,
  used_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (identity_key, usage_month)
);

comment on table public.free_usage_identities is
  '탈퇴 후에도 남는 기본 모드 월 사용량. 이메일은 해시로만 저장한다.';

alter table public.free_usage_identities enable row level security;

revoke all on table public.free_usage_identities from public, anon, authenticated;
grant select, insert, update on table public.free_usage_identities to service_role;

create or replace function public._hash_usage_identity(raw text)
returns text
language sql
immutable
as $$
  select encode(extensions.digest(convert_to(coalesce(raw, ''), 'UTF8'), 'sha256'::text), 'hex');
$$;

create or replace function public.free_usage_identity_keys(p_user_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  keys text[] := array[public._hash_usage_identity('user:' || p_user_id::text)];
  email text;
  phone text;
  rec record;
begin
  if p_user_id is null then
    return '{}';
  end if;

  select nullif(lower(trim(u.email)), ''), nullif(trim(u.phone), '')
    into email, phone
    from auth.users u
   where u.id = p_user_id;

  if email is not null then
    keys := array_append(keys, public._hash_usage_identity('email:' || email));
  end if;
  if phone is not null then
    keys := array_append(keys, public._hash_usage_identity('phone:' || phone));
  end if;

  for rec in
    select i.provider, i.provider_id, i.identity_data
      from auth.identities i
     where i.user_id = p_user_id
  loop
    if rec.provider is not null and rec.provider_id is not null then
      keys := array_append(
        keys,
        public._hash_usage_identity(rec.provider || ':' || rec.provider_id)
      );
    end if;
    if rec.identity_data ? 'email' and length(trim(rec.identity_data->>'email')) > 0 then
      keys := array_append(
        keys,
        public._hash_usage_identity('email:' || lower(trim(rec.identity_data->>'email')))
      );
    end if;
  end loop;

  return (select array_agg(distinct k) from unnest(keys) as k);
end;
$$;

create or replace function public._meetings_used_seconds(p_user_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(sum(greatest(coalesce(duration, 0), 0)), 0)::int
    from public.meetings
   where user_id = p_user_id
     and timezone('Asia/Seoul', created_at) >= date_trunc('month', timezone('Asia/Seoul', now()));
$$;

create or replace function public._current_free_used_seconds(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  month text := public.usage_month_kst();
  keys text[] := public.free_usage_identity_keys(p_user_id);
  used int := 0;
  stored_month text;
  settings_used int := 0;
  ledger_used int := 0;
begin
  select usage_month, coalesce(usage_seconds, 0)
    into stored_month, settings_used
    from public.user_settings
   where user_id = p_user_id;

  if found and stored_month is not distinct from month then
    used := greatest(used, settings_used);
  end if;

  select coalesce(max(used_seconds), 0)
    into ledger_used
    from public.free_usage_identities
   where usage_month = month
     and identity_key = any (keys);

  used := greatest(used, ledger_used, public._meetings_used_seconds(p_user_id));
  return used;
end;
$$;

create or replace function public.stamp_free_usage_for_user(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  month text := public.usage_month_kst();
  keys text[] := public.free_usage_identity_keys(p_user_id);
  used int := public._current_free_used_seconds(p_user_id);
  k text;
begin
  if p_user_id is null then
    return 0;
  end if;

  foreach k in array keys loop
    insert into public.free_usage_identities (identity_key, usage_month, used_seconds, updated_at)
    values (k, month, used, now())
    on conflict (identity_key, usage_month) do update
      set used_seconds = greatest(public.free_usage_identities.used_seconds, excluded.used_seconds),
          updated_at = now();
  end loop;

  return used;
end;
$$;

create or replace function public.get_free_usage_for_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_sec int := 300;
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
  limit_sec int := 300;
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

create or replace function public.get_free_usage()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  return public.get_free_usage_for_user(auth.uid());
end;
$$;

create or replace function public.consume_free_usage(p_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  return public.consume_free_usage_for_user(auth.uid(), p_seconds);
end;
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  perform public.stamp_free_usage_for_user(uid);

  delete from public.timeline_meetings
  where timeline_id in (select id from public.timelines where user_id = uid)
     or meeting_id in (select id from public.meetings where user_id = uid);

  delete from public.meeting_minutes
  where meeting_id in (select id from public.meetings where user_id = uid);

  delete from public.meetings where user_id = uid;
  delete from public.timelines where user_id = uid;
  delete from public.user_settings where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public._hash_usage_identity(text) from public, anon, authenticated;
revoke all on function public.free_usage_identity_keys(uuid) from public, anon, authenticated;
revoke all on function public._meetings_used_seconds(uuid) from public, anon, authenticated;
revoke all on function public._current_free_used_seconds(uuid) from public, anon, authenticated;
revoke all on function public.stamp_free_usage_for_user(uuid) from public, anon, authenticated;
revoke all on function public.get_free_usage_for_user(uuid) from public, anon, authenticated;
revoke all on function public.consume_free_usage_for_user(uuid, integer) from public, anon, authenticated;
revoke all on function public.get_free_usage() from public;
revoke all on function public.consume_free_usage(integer) from public;

grant execute on function public.get_free_usage() to authenticated;
grant execute on function public.consume_free_usage(integer) to authenticated;
grant execute on function public.stamp_free_usage_for_user(uuid) to service_role;
grant execute on function public.get_free_usage_for_user(uuid) to service_role;
grant execute on function public.consume_free_usage_for_user(uuid, integer) to service_role;
