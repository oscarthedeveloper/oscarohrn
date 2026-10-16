-- Kör i Supabase SQL Editor. Kör sedan sista INSERT med ditt användar-ID.
begin;
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.site_content (
  id integer primary key check (id = 1),
  content jsonb,
  version integer not null default 0
);
alter table public.site_admins enable row level security;
alter table public.site_content enable row level security;
revoke all on public.site_admins from anon, authenticated;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_admins to authenticated;
grant select on public.site_content to anon, authenticated;
grant update(content, version) on public.site_content to authenticated;
drop policy if exists "Read own admin membership" on public.site_admins;
create policy "Read own admin membership" on public.site_admins for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Public content" on public.site_content;
create policy "Public content" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "Only listed admins edit" on public.site_content;
create policy "Only listed admins edit" on public.site_content for update to authenticated
  using (exists(select 1 from public.site_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.site_admins where user_id = (select auth.uid())));
insert into public.site_content (id) values (1) on conflict do nothing;
commit;
-- Skapa användaren under Authentication > Users och klistra in dess UUID här:
-- insert into public.site_admins (user_id) values ('ANVÄNDARENS-UUID') on conflict do nothing;
