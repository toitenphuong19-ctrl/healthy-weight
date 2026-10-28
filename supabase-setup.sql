-- Healthy Weight 2.1: chỉ đồng bộ khi người dùng đăng nhập.
-- Chạy trong Supabase > SQL Editor một lần, trên dự án của bạn.
create table if not exists public.health_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now(),
  constraint snapshot_is_object check (jsonb_typeof(snapshot)='object'),
  constraint snapshot_size_limit check (pg_column_size(snapshot)<1048576)
);
alter table public.health_snapshots enable row level security;
revoke all on table public.health_snapshots from anon, authenticated;
grant select, insert, update on table public.health_snapshots to authenticated;
-- Policies are idempotently created: do not relax these rules for convenience.
drop policy if exists hw_select_own on public.health_snapshots;
create policy hw_select_own on public.health_snapshots for select to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists hw_insert_own on public.health_snapshots;
create policy hw_insert_own on public.health_snapshots for insert to authenticated
with check ((select auth.uid()) = user_id);
drop policy if exists hw_update_own on public.health_snapshots;
create policy hw_update_own on public.health_snapshots for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
-- No delete policy and no anon grants. Users cannot read/write another account's rows.
