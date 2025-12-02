-- Core multi-parish schema for Altar One
-- Run this in your Supabase SQL editor.

create table public.parishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  location text,
  theme jsonb default '{}'::jsonb,
  livestream_link text,
  created_at timestamptz default now()
);

create table public.users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  parish_id uuid not null references public.parishes (id) on delete restrict,
  role text not null check (role in ('member', 'admin')),
  display_name text,
  created_at timestamptz default now()
);

-- Generic helper type to reduce repetition (not enforced, just a convention)
-- Each content table MUST include parish_id.

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  title text not null,
  lyrics text,
  category text,
  youtube_url text,
  source text, -- 'manual' | 'ocr' | 'youtube_sync'
  created_by uuid references public.users (user_id),
  created_at timestamptz default now()
);

create table public.readings (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  title text not null,
  date date not null,
  content text not null,
  created_by uuid references public.users (user_id),
  created_at timestamptz default now()
);

create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  title text not null,
  body text not null,
  category text,
  created_by uuid references public.users (user_id),
  created_at timestamptz default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  title text not null,
  body text not null,
  scheduled_at timestamptz,
  created_by uuid references public.users (user_id),
  created_at timestamptz default now()
);

create table public.livestream (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  youtube_url text,
  facebook_url text,
  vimeo_url text,
  rtmp_url text,
  preferred_source text,
  updated_at timestamptz default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  location text,
  created_by uuid references public.users (user_id),
  created_at timestamptz default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  user_id uuid not null references public.users (user_id) on delete cascade,
  message text,
  media_url text,
  created_at timestamptz default now()
);

create table public.subscriptions (
  user_id uuid primary key references public.users (user_id) on delete cascade,
  parish_id uuid not null references public.parishes (id) on delete cascade,
  trial_start date not null,
  trial_end date not null,
  is_subscribed boolean default false,
  payment_reference text,
  updated_at timestamptz default now()
);

create table public.themes (
  parish_id uuid primary key references public.parishes (id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table public.parish_settings (
  parish_id uuid primary key references public.parishes (id) on delete cascade,
  livestream_preferences jsonb default '{}'::jsonb,
  youtube_playlist text,
  ai_ocr_mode text,
  content_auto_approval boolean default false,
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  user_id uuid not null references public.users (user_id) on delete cascade,
  job_type text not null, -- 'song_ocr' | 'reading_format' | 'prayer_generate' | 'announcement_generate' | 'youtube_sync'
  payload jsonb not null,
  status text not null default 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  result jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.youtube_sync (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes (id) on delete cascade,
  channel_id text,
  playlist_id text,
  last_synced_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create table public.app_updates (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid references public.parishes (id) on delete cascade,
  feature_flags jsonb default '{}'::jsonb,
  theme_overrides jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS: enforce parish isolation

alter table public.parishes enable row level security;
alter table public.users enable row level security;
alter table public.songs enable row level security;
alter table public.readings enable row level security;
alter table public.prayers enable row level security;
alter table public.announcements enable row level security;
alter table public.livestream enable row level security;
alter table public.events enable row level security;
alter table public.chat_messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.themes enable row level security;
alter table public.parish_settings enable row level security;
alter table public.ai_jobs enable row level security;
alter table public.youtube_sync enable row level security;
alter table public.app_updates enable row level security;

create or replace function public.current_user_parish_id()
returns uuid
language sql
stable
as $$
  select parish_id from public.users where user_id = auth.uid();
$$;

-- Users row must match auth user
create policy "Users can see and update self" on public.users
  for select using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Generic parish-locked policies
create policy "Members read own parish songs" on public.songs
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish songs" on public.songs
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u
      where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (
    parish_id = public.current_user_parish_id()
  );

-- Repeat similar policies for other content tables

create policy "Members read own parish readings" on public.readings
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish readings" on public.readings
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u
      where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (parish_id = public.current_user_parish_id());

create policy "Members read own parish prayers" on public.prayers
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish prayers" on public.prayers
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u
      where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (parish_id = public.current_user_parish_id());

create policy "Members read own parish announcements" on public.announcements
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish announcements" on public.announcements
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u
      where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (parish_id = public.current_user_parish_id());

create policy "Members read own parish livestream" on public.livestream
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish livestream" on public.livestream
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u
      where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (parish_id = public.current_user_parish_id());

create policy "Members read own parish events" on public.events
  for select using (parish_id = public.current_user_parish_id());

create policy "Admins manage own parish events" on public.events
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u
      where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (parish_id = public.current_user_parish_id());

create policy "Members chat in own parish" on public.chat_messages
  for all using (parish_id = public.current_user_parish_id())
  with check (parish_id = public.current_user_parish_id());

create policy "Members view own subscription" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "Admins manage subscriptions in parish" on public.subscriptions
  for all using (
    parish_id = public.current_user_parish_id()
    and exists (
      select 1 from public.users u where u.user_id = auth.uid() and u.role = 'admin'
    )
  ) with check (parish_id = public.current_user_parish_id());


