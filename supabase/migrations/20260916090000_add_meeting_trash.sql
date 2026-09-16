alter table public.meetings
add column if not exists deleted_at timestamptz;

create index if not exists meetings_user_id_deleted_at_idx
on public.meetings (user_id, deleted_at);
