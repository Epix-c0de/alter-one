create table public.sessions (
  id uuid not null default gen_random_uuid (),
  session_code text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius integer not null default 500,
  parish_id uuid not null,
  local_church_id uuid not null,
  created_by uuid not null,
  created_at timestamp with time zone not null default now(),
  is_active boolean not null default true,
  constraint sessions_pkey primary key (id),
  constraint sessions_session_code_key unique (session_code),
  constraint sessions_parish_id_fkey foreign key (parish_id) references parishes (id),
  constraint sessions_local_church_id_fkey foreign key (local_church_id) references local_churches (id),
  constraint sessions_created_by_fkey foreign key (created_by) references users (id)
);

-- Add RLS policies
alter table public.sessions enable row level security;

create policy "Enable read access for all users" on public.sessions
  for select using (true);

create policy "Enable insert for authenticated users only" on public.sessions
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for creators only" on public.sessions
  for update using (auth.uid() = created_by);
