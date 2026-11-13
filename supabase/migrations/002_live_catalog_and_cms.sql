-- 002: Live catalog sizes + shared storefront CMS content
-- Run this once in the Supabase SQL editor (safe to re-run).

-- 1. Per-product available sizes (US). NULL / empty = available in every size.
alter table public.products
  add column if not exists sizes numeric[];

-- Admin writes need WITH CHECK as well as USING for inserts/updates.
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- 2. Storefront content edited from /admin → Storefront CMS
create table if not exists public.site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select
  using (true);

drop policy if exists "Admins can manage site content" on public.site_content;
create policy "Admins can manage site content"
  on public.site_content for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_content (id, content)
values ('storefront', '{}'::jsonb)
on conflict (id) do nothing;

-- Make PostgREST pick up the new column/table immediately
notify pgrst, 'reload schema';
