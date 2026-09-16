alter table public.meeting_minutes
add column if not exists action_items jsonb default '[]'::jsonb;

alter table public.meeting_minutes
add column if not exists reply_draft text;
