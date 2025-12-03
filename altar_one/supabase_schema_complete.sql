-- ============================================================
-- COMPLETE DATABASE SCHEMA FOR ALTAR ONE
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable PostGIS extension for geospatial queries
create extension if not exists postgis;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Parishes table (updated with geospatial support)
create table if not exists public.parishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  location_text text,
  archdiocese text,
  polygon_geo_json jsonb, -- GeoJSON polygon for boundary matching
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Local Churches table
create table if not exists public.local_churches (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  name text not null,
  leader_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User Profiles (extends auth.users)
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  parish_id uuid references public.parishes(id) on delete restrict,
  local_church_id uuid references public.local_churches(id) on delete set null,
  trial_expired boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Users table (for role management)
create table if not exists public.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parish_id uuid not null references public.parishes(id) on delete restrict,
  role text not null default 'member' check (role in ('member', 'junior_admin', 'admin', 'master_admin')),
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Local Church ID Requests
create table if not exists public.local_church_id_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parish_id uuid not null references public.parishes(id) on delete cascade,
  local_church_id uuid references public.local_churches(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz
);

-- ============================================================
-- CONTENT TABLES
-- ============================================================

-- Parish Readings
create table if not exists public.parish_readings (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  date date not null,
  title text not null,
  first_reading text,
  second_reading text,
  psalm text,
  gospel text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(parish_id, date)
);

-- Parish Hymns
create table if not exists public.parish_hymns (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  category text not null, -- 'Entrada', 'Gloria', 'Responsorial Psalm', etc.
  title text not null,
  lyrics text,
  audio_url text,
  youtube_id text,
  chords_json jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mass Responses (English & Kiswahili)
create table if not exists public.mass_responses (
  id uuid primary key default gen_random_uuid(),
  language text not null check (language in ('English', 'Kiswahili')),
  category text not null, -- 'Introductory Rites', 'Liturgy of the Word', etc.
  title text not null,
  content text not null,
  is_global boolean default true, -- If true, available to all parishes
  parish_id uuid references public.parishes(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prayers
create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  category text not null, -- 'Rosary', 'Divine Mercy', 'St. Michael', etc.
  title text not null,
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Songs (separate from hymns for general music player)
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid references public.parishes(id) on delete cascade,
  archdiocese_id uuid, -- For archdiocese-wide songs
  is_universal boolean default false, -- Universal church songs
  title text not null,
  artist text,
  lyrics text,
  lyrics_json jsonb, -- For synced lyrics with timestamps
  audio_url text,
  youtube_id text,
  thumbnail_url text,
  duration_seconds int,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Livestreams
create table if not exists public.livestreams (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  local_church_id uuid references public.local_churches(id) on delete set null,
  stream_url text not null,
  stream_type text not null default 'youtube' check (stream_type in ('youtube', 'facebook', 'vimeo', 'rtmp', 'custom')),
  is_live boolean default false,
  start_time timestamptz,
  end_time timestamptz,
  title text,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  local_church_id uuid references public.local_churches(id) on delete set null,
  title text not null,
  body text not null,
  category text, -- 'General', 'Event', 'Payment', 'Livestream', etc.
  pinned boolean default false,
  scheduled_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat Messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_type text not null check (group_type in ('local_church', 'parish')),
  group_id uuid not null, -- local_church_id or parish_id
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  media_url text,
  media_type text check (media_type in ('image', 'audio', 'video')),
  reply_to_id uuid references public.chat_messages(id) on delete set null,
  reactions jsonb default '{}'::jsonb, -- {emoji: [user_ids]}
  delivered_to jsonb default '[]'::jsonb, -- [user_id]
  read_by jsonb default '[]'::jsonb, -- [user_id]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTION & PAYMENT TABLES
-- ============================================================

-- Subscriptions
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parish_id uuid not null references public.parishes(id) on delete cascade,
  active boolean default false,
  trial_expired boolean default false,
  trial_start date,
  trial_end date,
  expiry_date date,
  payment_reference text,
  payment_method text, -- 'mpesa', 'stripe', 'card'
  amount_paid numeric(10, 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payment History
create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parish_id uuid not null references public.parishes(id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_method text not null,
  payment_reference text,
  status text not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  invoice_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- APP CONFIGURATION TABLES
-- ============================================================

-- App Media (splash, banners, etc.)
create table if not exists public.app_media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image', 'video')),
  placement text not null check (placement in ('splash', 'home', 'banner')),
  url text not null,
  thumbnail_url text,
  parish_id uuid references public.parishes(id) on delete cascade, -- null = global
  is_active boolean default true,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- App Theme
create table if not exists public.app_theme (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid references public.parishes(id) on delete cascade, -- null = global default
  primary_color text not null default '#5B8DEF',
  accent_color text not null default '#8E54E9',
  background_color text,
  gradients_json jsonb default '[]'::jsonb,
  is_master_theme boolean default false, -- Master admin can set global theme
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- App Updates
create table if not exists public.app_updates (
  id uuid primary key default gen_random_uuid(),
  version text not null, -- e.g., '1.2.3'
  description text,
  mandatory boolean default false,
  release_date date not null,
  created_at timestamptz default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- null = broadcast to all
  parish_id uuid references public.parishes(id) on delete cascade,
  type text not null check (type in ('announcement', 'livestream', 'payment', 'group_mention', 'general')),
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb, -- Deep link data
  read boolean default false,
  created_at timestamptz default now()
);

-- Notification Preferences
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  announcements_enabled boolean default true,
  livestream_alerts boolean default true,
  payment_notifications boolean default true,
  group_mentions boolean default true,
  mute_parish boolean default false,
  dnd_start_time time, -- e.g., '22:00:00'
  dnd_end_time time, -- e.g., '06:00:00'
  updated_at timestamptz default now()
);

-- ============================================================
-- ADMIN & AI TABLES
-- ============================================================

-- AI Jobs (OCR, etc.)
create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_type text not null check (job_type in ('song_ocr', 'reading_format', 'prayer_generate', 'announcement_generate', 'youtube_sync')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  result jsonb,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Parish Settings
create table if not exists public.parish_settings (
  parish_id uuid primary key references public.parishes(id) on delete cascade,
  livestream_preferences jsonb default '{}'::jsonb,
  youtube_playlist text,
  ai_ocr_mode text,
  content_auto_approval boolean default false,
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

create index if not exists idx_user_profiles_parish on public.user_profiles(parish_id);
create index if not exists idx_user_profiles_local_church on public.user_profiles(local_church_id);
create index if not exists idx_local_church_id_requests_user on public.local_church_id_requests(user_id);
create index if not exists idx_local_church_id_requests_status on public.local_church_id_requests(status);
create index if not exists idx_parish_readings_date on public.parish_readings(parish_id, date);
create index if not exists idx_parish_hymns_category on public.parish_hymns(parish_id, category);
create index if not exists idx_mass_responses_language on public.mass_responses(language, category);
create index if not exists idx_prayers_category on public.prayers(parish_id, category);
create index if not exists idx_songs_parish on public.songs(parish_id);
create index if not exists idx_livestreams_parish on public.livestreams(parish_id, is_live);
create index if not exists idx_announcements_parish on public.announcements(parish_id, pinned, created_at desc);
create index if not exists idx_chat_messages_group on public.chat_messages(group_type, group_id, created_at desc);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_payment_history_user on public.payment_history(user_id, created_at desc);
create index if not exists idx_app_media_placement on public.app_media(placement, is_active, order_index);
create index if not exists idx_notifications_user on public.notifications(user_id, read, created_at desc);
create index if not exists idx_ai_jobs_status on public.ai_jobs(parish_id, status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.parishes enable row level security;
alter table public.local_churches enable row level security;
alter table public.user_profiles enable row level security;
alter table public.users enable row level security;
alter table public.local_church_id_requests enable row level security;
alter table public.parish_readings enable row level security;
alter table public.parish_hymns enable row level security;
alter table public.mass_responses enable row level security;
alter table public.prayers enable row level security;
alter table public.songs enable row level security;
alter table public.livestreams enable row level security;
alter table public.announcements enable row level security;
alter table public.chat_messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_history enable row level security;
alter table public.app_media enable row level security;
alter table public.app_theme enable row level security;
alter table public.app_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.parish_settings enable row level security;

-- Helper function to get current user's parish_id
create or replace function public.current_user_parish_id()
returns uuid
language sql
stable
security definer
as $$
  select parish_id from public.user_profiles where user_id = auth.uid();
$$;

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.users
    where user_id = auth.uid() and role in ('admin', 'master_admin')
  );
$$;

-- Helper function to check if user is junior admin
create or replace function public.is_junior_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.users
    where user_id = auth.uid() and role in ('junior_admin', 'admin', 'master_admin')
  );
$$;

-- Parishes: All authenticated users can read
create policy "Anyone authenticated can view parishes" on public.parishes
  for select using (auth.role() = 'authenticated');

-- Local Churches: Users can see churches in their parish
create policy "Users see local churches in their parish" on public.local_churches
  for select using (
    parish_id = public.current_user_parish_id() or public.is_admin()
  );

-- User Profiles: Users can see and update their own profile
create policy "Users see own profile" on public.user_profiles
  for select using (user_id = auth.uid());

create policy "Users update own profile" on public.user_profiles
  for update using (user_id = auth.uid());

-- Users table: Users see their own record
create policy "Users see own user record" on public.users
  for select using (user_id = auth.uid());

-- Local Church ID Requests: Users see their own requests, admins see all in parish
create policy "Users see own requests" on public.local_church_id_requests
  for select using (user_id = auth.uid());

create policy "Admins see all requests in parish" on public.local_church_id_requests
  for select using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  );

create policy "Users create own requests" on public.local_church_id_requests
  for insert with check (user_id = auth.uid());

create policy "Admins update requests in parish" on public.local_church_id_requests
  for update using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  );

-- Parish Readings: Members read own parish, admins manage
create policy "Members read own parish readings" on public.parish_readings
  for select using (parish_id = public.current_user_parish_id() or is_global = true);

create policy "Admins manage own parish readings" on public.parish_readings
  for all using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  ) with check (parish_id = public.current_user_parish_id());

-- Parish Hymns: Members read own parish, admins manage
create policy "Members read own parish hymns" on public.parish_hymns
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish hymns" on public.parish_hymns
  for all using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  ) with check (parish_id = public.current_user_parish_id());

-- Mass Responses: All authenticated users can read (global or parish-specific)
create policy "Anyone can read mass responses" on public.mass_responses
  for select using (
    auth.role() = 'authenticated' and (
      is_global = true or parish_id = public.current_user_parish_id()
    )
  );

create policy "Admins manage mass responses" on public.mass_responses
  for all using (public.is_admin());

-- Prayers: Members read own parish, admins manage
create policy "Members read own parish prayers" on public.prayers
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish prayers" on public.prayers
  for all using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  ) with check (parish_id = public.current_user_parish_id());

-- Songs: Members read own parish/archdiocese/universal, admins manage
create policy "Members read songs" on public.songs
  for select using (
    auth.role() = 'authenticated' and (
      is_universal = true or
      parish_id = public.current_user_parish_id() or
      archdiocese_id in (
        select archdiocese from public.parishes where id = public.current_user_parish_id()
      )
    )
  );

create policy "Admins manage songs" on public.songs
  for all using (
    (parish_id = public.current_user_parish_id() or is_universal = true) and public.is_junior_admin()
  );

-- Livestreams: Members read own parish, admins manage
create policy "Members read own parish livestreams" on public.livestreams
  for select using (
    parish_id = public.current_user_parish_id() or
    (local_church_id in (
      select local_church_id from public.user_profiles where user_id = auth.uid()
    ))
  );

create policy "Admins manage own parish livestreams" on public.livestreams
  for all using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  ) with check (parish_id = public.current_user_parish_id());

-- Announcements: Members read own parish, admins manage
create policy "Members read own parish announcements" on public.announcements
  for select using (
    parish_id = public.current_user_parish_id() or
    (local_church_id in (
      select local_church_id from public.user_profiles where user_id = auth.uid()
    ))
  );

create policy "Admins manage own parish announcements" on public.announcements
  for all using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  ) with check (parish_id = public.current_user_parish_id());

-- Chat Messages: Members chat in own groups, admins moderate
create policy "Members chat in own groups" on public.chat_messages
  for select using (
    (group_type = 'parish' and group_id = public.current_user_parish_id()) or
    (group_type = 'local_church' and group_id in (
      select local_church_id from public.user_profiles where user_id = auth.uid()
    ))
  );

create policy "Members send messages in own groups" on public.chat_messages
  for insert with check (
    user_id = auth.uid() and (
      (group_type = 'parish' and group_id = public.current_user_parish_id()) or
      (group_type = 'local_church' and group_id in (
        select local_church_id from public.user_profiles where user_id = auth.uid()
      ))
    )
  );

create policy "Admins delete messages in parish" on public.chat_messages
  for delete using (
    (group_type = 'parish' and group_id = public.current_user_parish_id() and public.is_junior_admin()) or
    (group_type = 'local_church' and group_id in (
      select local_church_id from public.local_churches where parish_id = public.current_user_parish_id()
    ) and public.is_junior_admin())
  );

-- Subscriptions: Users see own subscription
create policy "Users see own subscription" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "Admins manage subscriptions in parish" on public.subscriptions
  for all using (
    parish_id = public.current_user_parish_id() and public.is_admin()
  ) with check (parish_id = public.current_user_parish_id());

-- Payment History: Users see own payments
create policy "Users see own payment history" on public.payment_history
  for select using (user_id = auth.uid());

-- App Media: All authenticated users can read
create policy "Anyone can read app media" on public.app_media
  for select using (
    auth.role() = 'authenticated' and (
      parish_id is null or parish_id = public.current_user_parish_id()
    )
  );

create policy "Admins manage app media" on public.app_media
  for all using (public.is_admin());

-- App Theme: All authenticated users can read
create policy "Anyone can read app theme" on public.app_theme
  for select using (auth.role() = 'authenticated');

create policy "Admins manage app theme" on public.app_theme
  for all using (public.is_admin());

-- App Updates: All authenticated users can read
create policy "Anyone can read app updates" on public.app_updates
  for select using (auth.role() = 'authenticated');

-- Notifications: Users see own notifications
create policy "Users see own notifications" on public.notifications
  for select using (user_id = auth.uid() or user_id is null);

create policy "Users update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- Notification Preferences: Users manage own preferences
create policy "Users manage own notification preferences" on public.notification_preferences
  for all using (user_id = auth.uid());

-- AI Jobs: Users see own jobs, admins see all in parish
create policy "Users see own AI jobs" on public.ai_jobs
  for select using (user_id = auth.uid());

create policy "Admins see all AI jobs in parish" on public.ai_jobs
  for select using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  );

create policy "Users create AI jobs" on public.ai_jobs
  for insert with check (user_id = auth.uid());

-- Parish Settings: Admins manage
create policy "Admins manage parish settings" on public.parish_settings
  for all using (
    parish_id = public.current_user_parish_id() and public.is_junior_admin()
  );

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Match parish polygon (geospatial matching)
create or replace function public.match_parish_polygon(
  lat double precision,
  lng double precision
)
returns uuid
language plpgsql
security definer
as $$
declare
  matched_parish_id uuid;
begin
  -- Convert lat/lng to PostGIS point
  -- Note: This assumes polygon_geo_json contains GeoJSON format
  -- You may need to adjust based on your actual GeoJSON structure
  select id into matched_parish_id
  from public.parishes
  where polygon_geo_json is not null
    and st_contains(
      st_geomfromgeojson(polygon_geo_json::text),
      st_point(lng, lat)
    )
  limit 1;
  
  return matched_parish_id;
end;
$$;

-- Request Local Church ID
create or replace function public.request_local_church_id(
  p_user_id uuid,
  p_parish_id uuid,
  p_local_church_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  request_id uuid;
begin
  insert into public.local_church_id_requests (user_id, parish_id, local_church_id, status)
  values (p_user_id, p_parish_id, p_local_church_id, 'pending')
  returning id into request_id;
  
  return request_id;
end;
$$;

-- Approve Local Church ID Request (Admin only)
create or replace function public.approve_local_church_id(
  p_request_id uuid,
  p_local_church_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_parish_id uuid;
begin
  -- Check admin permission
  if not public.is_junior_admin() then
    raise exception 'Unauthorized: Admin access required';
  end if;
  
  -- Get request details
  select user_id, parish_id into v_user_id, v_parish_id
  from public.local_church_id_requests
  where id = p_request_id;
  
  if v_user_id is null then
    raise exception 'Request not found';
  end if;
  
  -- Update user profile
  update public.user_profiles
  set local_church_id = p_local_church_id,
      updated_at = now()
  where user_id = v_user_id;
  
  -- Update request status
  update public.local_church_id_requests
  set status = 'approved',
      local_church_id = p_local_church_id,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_request_id;
  
  return true;
end;
$$;

-- Reject Local Church ID Request
create or replace function public.reject_local_church_id(
  p_request_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  if not public.is_junior_admin() then
    raise exception 'Unauthorized: Admin access required';
  end if;
  
  update public.local_church_id_requests
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_request_id;
  
  return true;
end;
$$;

-- Toggle Live Status (Admin only)
create or replace function public.toggle_live_status(
  p_livestream_id uuid,
  p_is_live boolean
)
returns boolean
language plpgsql
security definer
as $$
begin
  if not public.is_junior_admin() then
    raise exception 'Unauthorized: Admin access required';
  end if;
  
  update public.livestreams
  set is_live = p_is_live,
      updated_at = now()
  where id = p_livestream_id
    and parish_id = public.current_user_parish_id();
  
  return true;
end;
$$;

-- Admin Update Theme
create or replace function public.admin_update_theme(
  p_parish_id uuid,
  p_primary_color text,
  p_accent_color text,
  p_background_color text default null,
  p_gradients_json jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  theme_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: Admin access required';
  end if;
  
  insert into public.app_theme (
    parish_id, primary_color, accent_color, background_color, gradients_json
  ) values (
    p_parish_id, p_primary_color, p_accent_color, p_background_color, p_gradients_json
  )
  on conflict (parish_id) do update
  set primary_color = p_primary_color,
      accent_color = p_accent_color,
      background_color = p_background_color,
      gradients_json = p_gradients_json,
      updated_at = now()
  returning id into theme_id;
  
  return theme_id;
end;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create user profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email
  );
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
create trigger update_parishes_updated_at before update on public.parishes
  for each row execute function public.update_updated_at_column();

create trigger update_local_churches_updated_at before update on public.local_churches
  for each row execute function public.update_updated_at_column();

create trigger update_user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.update_updated_at_column();

create trigger update_users_updated_at before update on public.users
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- INITIAL DATA (Optional seed data)
-- ============================================================

-- Insert default mass responses (English)
insert into public.mass_responses (language, category, title, content, is_global) values
('English', 'Introductory Rites', 'Greeting', 'The Lord be with you. / And with your spirit.', true),
('English', 'Liturgy of the Word', 'Gospel Acclamation', 'Alleluia, alleluia!', true),
('English', 'Liturgy of the Eucharist', 'Eucharistic Prayer', 'Holy, Holy, Holy Lord God of hosts...', true)
on conflict do nothing;

-- Insert default mass responses (Kiswahili)
insert into public.mass_responses (language, category, title, content, is_global) values
('Kiswahili', 'Introductory Rites', 'Salamu', 'Bwana akiwe nawe. / Na nawe pia roho yako.', true),
('Kiswahili', 'Liturgy of the Word', 'Sifa ya Injili', 'Aleluya, aleluya!', true),
('Kiswahili', 'Liturgy of the Eucharist', 'Somo la Ekaristi', 'Mtakatifu, Mtakatifu, Mtakatifu Bwana Mungu...', true)
on conflict do nothing;

-- ============================================================
-- END OF SCHEMA
-- ============================================================

