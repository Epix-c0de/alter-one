-- Upgrade sessions table
alter table public.sessions 
add column if not exists title text,
add column if not exists session_type text check (session_type in ('mass', 'live', 'meeting', 'other')) default 'mass',
add column if not exists start_time timestamp with time zone default now(),
add column if not exists end_time timestamp with time zone,
add column if not exists metadata jsonb default '{}'::jsonb;

-- Create session_content_mappings table
create table public.session_content_mappings (
  id uuid not null default gen_random_uuid (),
  session_id uuid not null,
  content_type text not null check (content_type in ('reading', 'song', 'prayer', 'announcement')),
  content_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint session_content_mappings_pkey primary key (id),
  constraint session_content_mappings_session_id_fkey foreign key (session_id) references sessions (id) on delete cascade
);

-- Add RLS policies for session_content_mappings
alter table public.session_content_mappings enable row level security;

create policy "Enable read access for all users" on public.session_content_mappings
  for select using (true);

create policy "Enable insert for authenticated users only" on public.session_content_mappings
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for creators only" on public.session_content_mappings
  for update using (
    exists (
      select 1 from sessions 
      where sessions.id = session_content_mappings.session_id 
      and sessions.created_by = auth.uid()
    )
  );
