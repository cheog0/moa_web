create or replace function public._hash_usage_identity(raw text)
returns text
language sql
immutable
as $$
  select encode(extensions.digest(convert_to(coalesce(raw, ''), 'UTF8'), 'sha256'::text), 'hex');
$$;
