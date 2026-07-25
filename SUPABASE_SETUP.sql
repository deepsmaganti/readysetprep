-- ReadySetPrep Supabase schema
-- Run this in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  level text not null default 'primary2'
    check (level in ('primary2','primary3','primary4','lower','middle','upper')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_user_id_idx
  on public.students(user_id);

create table if not exists public.student_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  state_key text not null,
  state_value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, state_key)
);

create index if not exists student_state_user_id_idx
  on public.student_state(user_id);

create index if not exists student_state_student_id_idx
  on public.student_state(student_id);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_state enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "students_select_own" on public.students;
create policy "students_select_own"
on public.students for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "students_insert_own" on public.students;
create policy "students_insert_own"
on public.students for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "students_update_own" on public.students;
create policy "students_update_own"
on public.students for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
on public.students for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "student_state_select_own" on public.student_state;
create policy "student_state_select_own"
on public.student_state for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
  and exists (
    select 1 from public.students s
    where s.id = student_state.student_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "student_state_insert_own" on public.student_state;
create policy "student_state_insert_own"
on public.student_state for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
  and exists (
    select 1 from public.students s
    where s.id = student_state.student_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "student_state_update_own" on public.student_state;
create policy "student_state_update_own"
on public.student_state for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
  and exists (
    select 1 from public.students s
    where s.id = student_state.student_id
      and s.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
  and exists (
    select 1 from public.students s
    where s.id = student_state.student_id
      and s.user_id = (select auth.uid())
  )
);

drop policy if exists "student_state_delete_own" on public.student_state;
create policy "student_state_delete_own"
on public.student_state for delete
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
  and exists (
    select 1 from public.students s
    where s.id = student_state.student_id
      and s.user_id = (select auth.uid())
  )
);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.student_state to authenticated;

revoke all on public.profiles from anon;
revoke all on public.students from anon;
revoke all on public.student_state from anon;
