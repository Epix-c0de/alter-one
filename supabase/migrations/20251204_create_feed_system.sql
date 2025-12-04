-- ============================================================
-- FEED SYSTEM DATABASE SCHEMA
-- Hybrid Multi-Level Catholic Content Feed System
-- ============================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================
-- FEED POSTS TABLE
-- ============================================================
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  archdiocese_id uuid references public.archdioceses(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  
  -- Content
  content text not null,
  
  -- Post metadata
  tier text not null check (tier in ('local', 'archdiocese', 'national')),
  post_type text check (post_type in ('event', 'announcement', 'testimony', 'gallery', 'youth', 'choir', 'catechism', 'general')),
  
  -- Event details (optional)
  event_date timestamptz,
  
  -- Engagement counts (denormalized for performance)
  like_count int default 0,
  comment_count int default 0,
  share_count int default 0,
  
  -- Moderation
  is_pinned boolean default false,
  pinned_at timestamptz,
  pinned_by uuid references auth.users(id),
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FEED MEDIA TABLE
-- ============================================================
create table if not exists public.feed_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  
  media_type text not null check (media_type in ('photo', 'video')),
  url text not null,
  thumbnail_url text,
  
  -- For ordering multiple media items
  order_index int default 0,
  
  -- Video metadata
  duration_seconds int,
  
  created_at timestamptz default now()
);

-- ============================================================
-- FEED LIKES TABLE
-- ============================================================
create table if not exists public.feed_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  created_at timestamptz default now(),
  
  -- Ensure one like per user per post
  unique(post_id, user_id)
);

-- ============================================================
-- FEED COMMENTS TABLE
-- ============================================================
create table if not exists public.feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  content text not null,
  
  -- For nested threads (one level deep)
  parent_comment_id uuid references public.feed_comments(id) on delete cascade,
  
  -- Engagement
  like_count int default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FEED COMMENT LIKES TABLE
-- ============================================================
create table if not exists public.feed_comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.feed_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  created_at timestamptz default now(),
  
  unique(comment_id, user_id)
);

-- ============================================================
-- FEED SHARES TABLE
-- ============================================================
create table if not exists public.feed_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  share_type text not null check (share_type in ('internal', 'whatsapp', 'facebook', 'email')),
  
  created_at timestamptz default now()
);

-- ============================================================
-- FEED SAVES TABLE
-- ============================================================
create table if not exists public.feed_saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  created_at timestamptz default now(),
  
  unique(post_id, user_id)
);

-- ============================================================
-- FEED REPORTS TABLE
-- ============================================================
create table if not exists public.feed_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
create index if not exists idx_feed_posts_parish on public.feed_posts(parish_id, created_at desc);
create index if not exists idx_feed_posts_archdiocese on public.feed_posts(archdiocese_id, created_at desc);
create index if not exists idx_feed_posts_tier on public.feed_posts(tier, created_at desc);
create index if not exists idx_feed_posts_pinned on public.feed_posts(parish_id, is_pinned, created_at desc);
create index if not exists idx_feed_posts_author on public.feed_posts(author_id, created_at desc);

create index if not exists idx_feed_media_post on public.feed_media(post_id, order_index);

create index if not exists idx_feed_likes_post on public.feed_likes(post_id);
create index if not exists idx_feed_likes_user on public.feed_likes(user_id, created_at desc);

create index if not exists idx_feed_comments_post on public.feed_comments(post_id, created_at desc);
create index if not exists idx_feed_comments_parent on public.feed_comments(parent_comment_id, created_at asc);

create index if not exists idx_feed_shares_post on public.feed_shares(post_id);
create index if not exists idx_feed_shares_user on public.feed_shares(user_id, created_at desc);

create index if not exists idx_feed_saves_user on public.feed_saves(user_id, created_at desc);

create index if not exists idx_feed_reports_status on public.feed_reports(status, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.feed_posts enable row level security;
alter table public.feed_media enable row level security;
alter table public.feed_likes enable row level security;
alter table public.feed_comments enable row level security;
alter table public.feed_comment_likes enable row level security;
alter table public.feed_shares enable row level security;
alter table public.feed_saves enable row level security;
alter table public.feed_reports enable row level security;

-- Helper function to get user's archdiocese_id
create or replace function public.current_user_archdiocese_id()
returns uuid
language sql
stable
security definer
as $$
  select archdiocese_id from public.users where id = auth.uid();
$$;

-- Feed Posts Policies
-- Users can view posts from their tier
create policy "Users can view local parish posts" on public.feed_posts
  for select using (
    tier = 'local' and parish_id in (
      select parish_id from public.users where id = auth.uid()
    )
  );

create policy "Users can view archdiocese posts" on public.feed_posts
  for select using (
    tier = 'archdiocese' and archdiocese_id in (
      select archdiocese_id from public.users where id = auth.uid()
    )
  );

create policy "Users can view national posts" on public.feed_posts
  for select using (tier = 'national');

-- Junior admins can create local posts only
create policy "Junior admins create local posts" on public.feed_posts
  for insert with check (
    tier = 'local' and
    parish_id in (select parish_id from public.users where id = auth.uid()) and
    author_id = auth.uid() and
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('junior_admin', 'admin')
    )
  );

-- Parish admins can create local and archdiocese posts
create policy "Parish admins create archdiocese posts" on public.feed_posts
  for insert with check (
    tier in ('local', 'archdiocese') and
    author_id = auth.uid() and
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Master admins can create all posts
create policy "Master admins create all posts" on public.feed_posts
  for insert with check (
    author_id = auth.uid() and
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Authors and admins can update their posts
create policy "Authors and admins update posts" on public.feed_posts
  for update using (
    author_id = auth.uid() or
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'junior_admin')
    )
  );

-- Authors and admins can delete their posts
create policy "Authors and admins delete posts" on public.feed_posts
  for delete using (
    author_id = auth.uid() or
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'junior_admin')
    )
  );

-- Feed Media Policies
create policy "Users view media for visible posts" on public.feed_media
  for select using (
    exists (
      select 1 from public.feed_posts
      where id = feed_media.post_id
    )
  );

create policy "Post authors manage media" on public.feed_media
  for all using (
    exists (
      select 1 from public.feed_posts
      where id = feed_media.post_id and author_id = auth.uid()
    )
  );

-- Feed Likes Policies
create policy "Users view likes" on public.feed_likes
  for select using (true);

create policy "Users manage own likes" on public.feed_likes
  for all using (user_id = auth.uid());

-- Feed Comments Policies
create policy "Users view comments" on public.feed_comments
  for select using (
    exists (
      select 1 from public.feed_posts
      where id = feed_comments.post_id
    )
  );

create policy "Users create comments" on public.feed_comments
  for insert with check (user_id = auth.uid());

create policy "Users update own comments" on public.feed_comments
  for update using (user_id = auth.uid());

create policy "Users and admins delete comments" on public.feed_comments
  for delete using (
    user_id = auth.uid() or
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'junior_admin')
    )
  );

-- Feed Comment Likes Policies
create policy "Users view comment likes" on public.feed_comment_likes
  for select using (true);

create policy "Users manage own comment likes" on public.feed_comment_likes
  for all using (user_id = auth.uid());

-- Feed Shares Policies
create policy "Users view shares" on public.feed_shares
  for select using (true);

create policy "Users create shares" on public.feed_shares
  for insert with check (user_id = auth.uid());

-- Feed Saves Policies
create policy "Users view own saves" on public.feed_saves
  for select using (user_id = auth.uid());

create policy "Users manage own saves" on public.feed_saves
  for all using (user_id = auth.uid());

-- Feed Reports Policies
create policy "Users create reports" on public.feed_reports
  for insert with check (user_id = auth.uid());

create policy "Admins view all reports" on public.feed_reports
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'junior_admin')
    )
  );

create policy "Admins update reports" on public.feed_reports
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'junior_admin')
    )
  );

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Get Local Parish Feed
create or replace function public.get_local_feed(
  p_user_id uuid,
  p_limit int default 10,
  p_offset int default 0
)
returns table (
  id uuid,
  parish_id uuid,
  author_id uuid,
  author_name text,
  author_role text,
  content text,
  tier text,
  post_type text,
  event_date timestamptz,
  like_count int,
  comment_count int,
  share_count int,
  is_pinned boolean,
  created_at timestamptz,
  user_has_liked boolean,
  user_has_saved boolean
)
language plpgsql
security definer
as $$
declare
  v_parish_id uuid;
begin
  -- Get user's parish
  select parish_id into v_parish_id
  from public.users
  where id = p_user_id;
  
  return query
  select
    fp.id,
    fp.parish_id,
    fp.author_id,
    u.name as author_name,
    u.role as author_role,
    fp.content,
    fp.tier,
    fp.post_type,
    fp.event_date,
    fp.like_count,
    fp.comment_count,
    fp.share_count,
    fp.is_pinned,
    fp.created_at,
    exists(select 1 from public.feed_likes where post_id = fp.id and user_id = p_user_id) as user_has_liked,
    exists(select 1 from public.feed_saves where post_id = fp.id and user_id = p_user_id) as user_has_saved
  from public.feed_posts fp
  join public.users u on u.id = fp.author_id
  where fp.tier = 'local'
    and fp.parish_id = v_parish_id
  order by fp.is_pinned desc, fp.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- Get Archdiocese Feed
create or replace function public.get_archdiocese_feed(
  p_user_id uuid,
  p_limit int default 10,
  p_offset int default 0
)
returns table (
  id uuid,
  parish_id uuid,
  author_id uuid,
  author_name text,
  author_role text,
  parish_name text,
  content text,
  tier text,
  post_type text,
  event_date timestamptz,
  like_count int,
  comment_count int,
  share_count int,
  is_pinned boolean,
  created_at timestamptz,
  user_has_liked boolean,
  user_has_saved boolean
)
language plpgsql
security definer
as $$
declare
  v_archdiocese_id uuid;
begin
  -- Get user's archdiocese
  select archdiocese_id into v_archdiocese_id
  from public.users
  where id = p_user_id;
  
  return query
  select
    fp.id,
    fp.parish_id,
    fp.author_id,
    u.name as author_name,
    u.role as author_role,
    p.parish_name,
    fp.content,
    fp.tier,
    fp.post_type,
    fp.event_date,
    fp.like_count,
    fp.comment_count,
    fp.share_count,
    fp.is_pinned,
    fp.created_at,
    exists(select 1 from public.feed_likes where post_id = fp.id and user_id = p_user_id) as user_has_liked,
    exists(select 1 from public.feed_saves where post_id = fp.id and user_id = p_user_id) as user_has_saved
  from public.feed_posts fp
  join public.users u on u.id = fp.author_id
  join public.parishes p on p.id = fp.parish_id
  where fp.tier = 'archdiocese'
    and fp.archdiocese_id = v_archdiocese_id
  order by fp.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- Get National Feed
create or replace function public.get_national_feed(
  p_user_id uuid,
  p_limit int default 10,
  p_offset int default 0
)
returns table (
  id uuid,
  author_id uuid,
  author_name text,
  author_role text,
  content text,
  tier text,
  post_type text,
  event_date timestamptz,
  like_count int,
  comment_count int,
  share_count int,
  created_at timestamptz,
  user_has_liked boolean,
  user_has_saved boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select
    fp.id,
    fp.author_id,
    u.name as author_name,
    u.role as author_role,
    fp.content,
    fp.tier,
    fp.post_type,
    fp.event_date,
    fp.like_count,
    fp.comment_count,
    fp.share_count,
    fp.created_at,
    exists(select 1 from public.feed_likes where post_id = fp.id and user_id = p_user_id) as user_has_liked,
    exists(select 1 from public.feed_saves where post_id = fp.id and user_id = p_user_id) as user_has_saved
  from public.feed_posts fp
  join public.users u on u.id = fp.author_id
  where fp.tier = 'national'
  order by fp.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- Trigger to update like count
create or replace function public.update_post_like_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.feed_posts
    set like_count = like_count + 1
    where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.feed_posts
    set like_count = like_count - 1
    where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger trigger_update_post_like_count
after insert or delete on public.feed_likes
for each row execute function public.update_post_like_count();

-- Trigger to update comment count
create or replace function public.update_post_comment_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.feed_posts
    set comment_count = comment_count + 1
    where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.feed_posts
    set comment_count = comment_count - 1
    where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger trigger_update_post_comment_count
after insert or delete on public.feed_comments
for each row execute function public.update_post_comment_count();

-- Trigger to update share count
create or replace function public.update_post_share_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.feed_posts
    set share_count = share_count + 1
    where id = NEW.post_id;
  end if;
  return null;
end;
$$;

create trigger trigger_update_post_share_count
after insert on public.feed_shares
for each row execute function public.update_post_share_count();

-- Trigger to update comment like count
create or replace function public.update_comment_like_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.feed_comments
    set like_count = like_count + 1
    where id = NEW.comment_id;
  elsif TG_OP = 'DELETE' then
    update public.feed_comments
    set like_count = like_count - 1
    where id = OLD.comment_id;
  end if;
  return null;
end;
$$;

create trigger trigger_update_comment_like_count
after insert or delete on public.feed_comment_likes
for each row execute function public.update_comment_like_count();
