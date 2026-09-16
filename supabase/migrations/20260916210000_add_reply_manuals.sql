alter table public.user_settings
add column if not exists reply_manuals jsonb default '[]'::jsonb;
