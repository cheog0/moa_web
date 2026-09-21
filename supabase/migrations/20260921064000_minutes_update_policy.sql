drop policy if exists "users can update own meeting minutes" on public.meeting_minutes;

create policy "users can update own meeting minutes"
on public.meeting_minutes
for update
using (
  exists (
    select 1 from public.meetings m
    where m.id = meeting_minutes.meeting_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.meetings m
    where m.id = meeting_minutes.meeting_id
      and m.user_id = auth.uid()
  )
);

grant update on public.meeting_minutes to authenticated, service_role;
