-- QR-ATT Admin role and read-only administrative access.
-- Apply this migration in Supabase SQL Editor after reviewing the existing policies.
-- It preserves existing records and does not modify attendance/event data.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'teacher', 'admin'));

-- Persist the exact QR payload used at event creation so reopening an event
-- does not change its date/time encoding or scanner validation behavior.
alter table public.events add column if not exists qr_payload text;

update public.events
set qr_payload = jsonb_strip_nulls(jsonb_build_object(
  'v', 1,
  'event', event_code,
  'title', title,
  'start', case when start_time is not null then to_char(start_time at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') else null end,
  'end', case when end_time is not null then to_char(end_time at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') else null end
))::text
where qr_payload is null;

-- A profile owner must not be able to promote their own account to admin,
-- and an admin cannot remove their own admin role through the client.
create or replace function public.guard_admin_role_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and (new.role = 'admin' or old.role = 'admin')
     and coalesce(auth.role(), '') not in ('service_role', 'supabase_admin')
     and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Administrator role changes must be performed by an authorized database administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_admin_role_changes on public.profiles;
create trigger guard_admin_role_changes
before update of role on public.profiles
for each row execute function public.guard_admin_role_changes();

-- SECURITY DEFINER avoids recursive evaluation of profiles RLS while checking the role.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Allow authorized administrators to read all profiles for user management.
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Allow administrators to review all attendance records; no write access is granted.
drop policy if exists "Admins can view all attendance" on public.attendance;
create policy "Admins can view all attendance"
  on public.attendance for select
  using (public.is_admin());

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists attendance_scanned_at_idx on public.attendance (scanned_at desc);
