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

  delete from public.project_meetings
  where project_id in (select id from public.projects where user_id = uid)
     or meeting_id in (select id from public.meetings where user_id = uid);

  delete from public.meetings where user_id = uid;
  delete from public.projects where user_id = uid;
  delete from public.user_settings where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
