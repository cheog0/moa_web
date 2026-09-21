alter table public.projects rename to timelines;
alter table public.project_meetings rename to timeline_meetings;
alter table public.timeline_meetings rename column project_id to timeline_id;

grant select, insert, update, delete on public.timelines to authenticated, service_role;
grant select, insert, update, delete on public.timeline_meetings to authenticated, service_role;

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
