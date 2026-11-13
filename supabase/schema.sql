-- SoleVerse Supabase Schema (Run in Supabase Dashboard -> SQL Editor)

-- 1. Profiles (extends auth.users with customer details + admin role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  country text not null default 'United States',
  address text not null default '',
  apartment text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Products (CMS catalog)
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null check (category in ('Running', 'Basketball', 'Lifestyle', 'Training', 'Limited Edition', 'Casual')),
  price numeric not null,
  original_price numeric,
  rating numeric not null default 4.8,
  reviews integer not null default 0,
  image text not null,
  alt_image text not null,
  colors text[] not null default '{}',
  badge text,
  in_stock boolean not null default true,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 3. Product Likes (guest + member likes)
create table if not exists public.product_likes (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(id) on delete cascade,
  visitor_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (product_id, visitor_id)
);

alter table public.product_likes enable row level security;

create policy "Anyone can view likes"
  on public.product_likes for select
  using (true);

create policy "Anyone can like products"
  on public.product_likes for insert
  with check (true);

create policy "Anyone can unlike own visitor like"
  on public.product_likes for delete
  using (true);

-- 4. Orders
create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tracking_number text not null,
  courier text not null,
  status text not null default 'Processing' check (status in ('Processing', 'In Transit', 'Delivered')),
  current_step integer not null default 1,
  estimated_delivery text not null default 'Dispatching in 24 hours',
  total_usd numeric not null,
  origin text not null default 'SoleVerse Global Fulfillment',
  destination text not null,
  customer_name text not null default '',
  customer_email text not null default '',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update all orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 5. Seed initial 16 sneakers
insert into public.products (id, name, brand, category, price, original_price, rating, reviews, image, alt_image, colors, badge, in_stock, likes_count) values
('nike-air-max-270', 'Nike Air Max 270 React', 'Nike', 'Running', 170, 195, 4.8, 324, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519861297062-a1eec154f81a?auto=format&fit=crop&w=900&q=80', array['#ef4444','#ffffff','#0a0a0a'], 'New', true, 128),
('jordan-1-retro-og', 'Air Jordan 1 Retro High OG', 'Jordan', 'Basketball', 185, null, 4.9, 512, 'https://images.unsplash.com/photo-1542219550-37153d387c27?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1751624310837-32ecd6bc6d94?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#c0c0c0','#ffffff'], 'Bestseller', true, 246),
('nb-574-classic', 'New Balance 574 Classic', 'New Balance', 'Lifestyle', 110, null, 4.7, 198, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?auto=format&fit=crop&w=900&q=80', array['#c0c0c0','#ffffff'], null, true, 84),
('jordan-1-collectors', 'Air Jordan 1 Collector''s Pack', 'Jordan', 'Limited Edition', 320, 380, 5.0, 87, 'https://images.unsplash.com/photo-1751624310837-32ecd6bc6d94?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1542219550-37153d387c27?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#ef4444','#ffffff'], 'Limited', true, 312),
('adidas-ultraboost-light', 'Adidas Ultraboost Light', 'Adidas', 'Training', 190, null, 4.8, 241, 'https://images.unsplash.com/photo-1519861297062-a1eec154f81a?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#ffffff'], null, true, 95),
('nike-air-force-1-07', 'Nike Air Force 1 ''07', 'Nike', 'Casual', 115, null, 4.9, 612, 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?auto=format&fit=crop&w=900&q=80', array['#ffffff'], 'Icon', true, 419),
('nb-990v6-usa', 'New Balance 990v6 Made in USA', 'New Balance', 'Running', 200, null, 4.8, 156, 'https://images.unsplash.com/photo-1643541323850-14dc38b00c12?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#c0c0c0'], 'New', true, 73),
('nb-550-vintage', 'New Balance 550 Vintage', 'New Balance', 'Basketball', 120, null, 4.7, 92, 'https://images.unsplash.com/photo-1621315271772-28b1f3a5df87?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80', array['#ffffff','#0a0a0a'], null, false, 64),
('nike-dunk-low-panda', 'Nike Dunk Low Retro ''Panda''', 'Nike', 'Casual', 115, null, 4.9, 845, 'https://images.unsplash.com/photo-1623684225794-a8f1f5037f5c?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#ffffff'], 'Bestseller', true, 530),
('jordan-1-mid-chicago', 'Air Jordan 1 Mid ''Chicago''', 'Jordan', 'Basketball', 135, null, 4.8, 418, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1542219550-37153d387c27?auto=format&fit=crop&w=900&q=80', array['#ef4444','#ffffff','#0a0a0a'], 'Hot', true, 289),
('nike-pegasus-41', 'Nike Air Zoom Pegasus 41', 'Nike', 'Running', 140, 160, 4.7, 276, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#3b82f6'], 'New', true, 112),
('adidas-gazelle-bold', 'Adidas Gazelle Bold', 'Adidas', 'Lifestyle', 120, null, 4.8, 304, 'https://images.unsplash.com/photo-1700853012811-ce0a42d2b6d3?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80', array['#ffffff','#10b981'], null, true, 143),
('puma-rs-x-efekt', 'Puma RS-X Efekt', 'Puma', 'Training', 115, 135, 4.6, 163, 'https://images.unsplash.com/photo-1750270438660-f57de76532cc?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519861297062-a1eec154f81a?auto=format&fit=crop&w=900&q=80', array['#3b82f6','#ffffff','#f97316'], null, true, 58),
('puma-suede-classic', 'Puma Suede Classic XXI', 'Puma', 'Casual', 75, null, 4.7, 389, 'https://images.unsplash.com/photo-1509442233604-131901ff8d40?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1623684225794-a8f1f5037f5c?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#ffffff'], null, true, 91),
('nike-dunk-university-red', 'Nike Dunk Low ''University Red''', 'Nike', 'Limited Edition', 155, 180, 4.9, 214, 'https://images.unsplash.com/photo-1600181516264-3ea807ff44b9?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80', array['#ef4444','#ffffff'], 'Limited', true, 204),
('jordan-1-shadow-2', 'Air Jordan 1 High ''Shadow 2.0''', 'Jordan', 'Limited Edition', 240, null, 4.9, 195, 'https://images.unsplash.com/photo-1567294999233-9cc7febb83b9?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1542219550-37153d387c27?auto=format&fit=crop&w=900&q=80', array['#0a0a0a','#c0c0c0'], 'Limited', true, 178)
on conflict (id) do nothing;

-- To promote your own account to Admin after signing up, run:
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
