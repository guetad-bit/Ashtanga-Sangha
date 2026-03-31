-- Ashtanga Sangha — Supabase Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  bio text,
  series text default 'primary',
  level text default 'regular',
  location text,
  practicing_since int,
  practicing_now boolean default false,
  practicing_started_at timestamptz,
  teacher text,
  streak int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Practice logs ─────────────────────────────────────────────────────────────
create table practice_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  series text not null,
  duration_min int,
  notes text,
  logged_at timestamptz default now()
);

alter table practice_logs enable row level security;
create policy "Users can view own logs" on practice_logs for select using (auth.uid() = user_id);
create policy "Community can see recent logs" on practice_logs for select using (true);
create policy "Users can insert own logs" on practice_logs for insert with check (auth.uid() = user_id);

-- ── Social: follows ───────────────────────────────────────────────────────────
create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

alter table follows enable row level security;
create policy "Follows are public" on follows for select using (true);
create policy "Users manage own follows" on follows for all using (auth.uid() = follower_id);

-- ── Social: posts ─────────────────────────────────────────────────────────────
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  image_url text,
  caption text,
  location text,
  likes_count int default 0,
  created_at timestamptz default now()
);

alter table posts enable row level security;
create policy "Posts are public" on posts for select using (true);
create policy "Users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

-- ── Social: likes ─────────────────────────────────────────────────────────────
create table likes (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

alter table likes enable row level security;
create policy "Likes are public" on likes for select using (true);
create policy "Users manage own likes" on likes for all using (auth.uid() = user_id);

-- Auto-update likes_count
create or replace function update_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts set likes_count = likes_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_like_change
  after insert or delete on likes
  for each row execute procedure update_likes_count();

-- ── Gatherings ────────────────────────────────────────────────────────────────
create table gatherings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  location text,
  country text,
  region text,
  start_date date,
  end_date date,
  price_usd int,
  spots_total int,
  spots_left int,
  teacher text,
  teacher_title text,
  description text,
  image_url text,
  tags text[],
  created_at timestamptz default now()
);

alter table gatherings enable row level security;
create policy "Gatherings are public" on gatherings for select using (true);

-- ── Gathering bookings ────────────────────────────────────────────────────────
create table gathering_bookings (
  id uuid default uuid_generate_v4() primary key,
  gathering_id uuid references gatherings(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text default 'pending', -- pending | confirmed | cancelled
  booked_at timestamptz default now(),
  unique(gathering_id, user_id)
);

alter table gathering_bookings enable row level security;
create policy "Users view own bookings" on gathering_bookings for select using (auth.uid() = user_id);
create policy "Users create own bookings" on gathering_bookings for insert with check (auth.uid() = user_id);

-- ── Moon days (static lookup) ─────────────────────────────────────────────────
create table moon_days (
  date date primary key,
  type text not null -- 'full_moon' | 'new_moon'
);

alter table moon_days enable row level security;
create policy "Moon days are public" on moon_days for select using (true);
