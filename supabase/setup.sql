create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  national_id text not null,
  username text not null,
  display_name text not null,
  email text not null,
  phone text not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'staff')),
  secondary_role text null check (secondary_role in ('vendedor', 'digital', 'caja')),
  branch text null check (branch in ('5 de julio', 'las americas')),
  is_active boolean not null default true,
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

alter table public.app_users enable row level security;

alter table public.app_users add column if not exists national_id text;
alter table public.app_users add column if not exists username text;
alter table public.app_users add column if not exists display_name text;
alter table public.app_users add column if not exists email text;
alter table public.app_users add column if not exists phone text;
alter table public.app_users add column if not exists password_hash text;
alter table public.app_users add column if not exists role text;
alter table public.app_users add column if not exists secondary_role text;
alter table public.app_users add column if not exists branch text;
alter table public.app_users add column if not exists is_active boolean default true;
alter table public.app_users add column if not exists last_seen_at timestamptz null;
alter table public.app_users add column if not exists created_at timestamptz default now();
alter table public.app_users add column if not exists created_by uuid null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'app_users_secondary_role_check'
  ) then
    alter table public.app_users
      add constraint app_users_secondary_role_check
      check (secondary_role in ('vendedor', 'digital', 'caja') or secondary_role is null);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'app_users_branch_check'
  ) then
    alter table public.app_users
      add constraint app_users_branch_check
      check (branch in ('5 de julio', 'las americas') or branch is null);
  end if;
end $$;

create unique index if not exists app_users_national_id_idx
  on public.app_users (national_id);

create unique index if not exists app_users_username_idx
  on public.app_users (username);

create index if not exists app_users_last_seen_at_idx
  on public.app_users (last_seen_at desc);

create table if not exists public.app_user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  connected_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz null
);

create index if not exists app_user_sessions_user_id_idx
  on public.app_user_sessions (user_id);

create index if not exists app_user_sessions_last_seen_at_idx
  on public.app_user_sessions (last_seen_at desc);

alter table public.app_user_sessions enable row level security;

alter table public.app_user_sessions add column if not exists user_id uuid null;
alter table public.app_user_sessions add column if not exists connected_at timestamptz default now();
alter table public.app_user_sessions add column if not exists last_seen_at timestamptz default now();
alter table public.app_user_sessions add column if not exists ended_at timestamptz null;

create table if not exists public.security_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.app_users(id) on delete set null,
  username text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists security_alerts_created_at_idx
  on public.security_alerts (created_at desc);

alter table public.security_alerts enable row level security;

alter table public.security_alerts add column if not exists user_id uuid null;
alter table public.security_alerts add column if not exists username text;
alter table public.security_alerts add column if not exists detail text;
alter table public.security_alerts add column if not exists created_at timestamptz default now();

create table if not exists public.password_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  username text not null,
  display_name text not null,
  recovery_code text not null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  used_at timestamptz null
);

create index if not exists password_recovery_requests_created_at_idx
  on public.password_recovery_requests (created_at desc);

create index if not exists password_recovery_requests_user_id_idx
  on public.password_recovery_requests (user_id);

alter table public.password_recovery_requests enable row level security;

alter table public.password_recovery_requests add column if not exists user_id uuid null;
alter table public.password_recovery_requests add column if not exists username text;
alter table public.password_recovery_requests add column if not exists display_name text;
alter table public.password_recovery_requests add column if not exists recovery_code text;
alter table public.password_recovery_requests add column if not exists expires_at timestamptz default now();
alter table public.password_recovery_requests add column if not exists created_at timestamptz default now();
alter table public.password_recovery_requests add column if not exists used_at timestamptz null;
alter table public.password_recovery_requests alter column expires_at drop not null;

insert into storage.buckets (id, name, public, file_size_limit)
select 'client-files', 'client-files', false, 20971520
where not exists (
  select 1 from storage.buckets where id = 'client-files'
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text null,
  email text null,
  document_id text null,
  address text null,
  preferred_branch text null,
  reference_files text null,
  notes text null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

create index if not exists clients_created_at_idx
  on public.clients (created_at desc);

alter table public.clients enable row level security;

alter table public.clients add column if not exists name text;
alter table public.clients add column if not exists phone text null;
alter table public.clients add column if not exists email text null;
alter table public.clients add column if not exists document_id text null;
alter table public.clients add column if not exists address text null;
alter table public.clients add column if not exists preferred_branch text null;
alter table public.clients add column if not exists reference_files text null;
alter table public.clients add column if not exists notes text null;
alter table public.clients add column if not exists created_at timestamptz default now();
alter table public.clients add column if not exists created_by uuid null;

create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  file_type text null,
  file_size bigint null,
  created_at timestamptz not null default now(),
  uploaded_by uuid null references public.app_users(id) on delete set null
);

create index if not exists client_files_client_id_idx
  on public.client_files (client_id);

create index if not exists client_files_created_at_idx
  on public.client_files (created_at desc);

alter table public.client_files enable row level security;

alter table public.client_files add column if not exists client_id uuid null;
alter table public.client_files add column if not exists file_name text;
alter table public.client_files add column if not exists storage_path text;
alter table public.client_files add column if not exists file_type text null;
alter table public.client_files add column if not exists file_size bigint null;
alter table public.client_files add column if not exists created_at timestamptz default now();
alter table public.client_files add column if not exists uploaded_by uuid null;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  description text null,
  quantity integer not null check (quantity > 0),
  material text null,
  size text null,
  due_date date null,
  status text not null check (status in ('recibido', 'disenando', 'imprimiendo', 'listo', 'entregado')),
  total_amount numeric(12,2) null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

alter table public.orders enable row level security;

alter table public.orders add column if not exists client_id uuid null;
alter table public.orders add column if not exists title text;
alter table public.orders add column if not exists description text null;
alter table public.orders add column if not exists quantity integer;
alter table public.orders add column if not exists material text null;
alter table public.orders add column if not exists size text null;
alter table public.orders add column if not exists due_date date null;
alter table public.orders add column if not exists status text;
alter table public.orders add column if not exists total_amount numeric(12,2) null;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists created_by uuid null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'clients_created_by_fkey'
  ) then
    alter table public.clients
      add constraint clients_created_by_fkey
      foreign key (created_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_client_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'client_files_client_id_fkey'
  ) then
    alter table public.client_files
      add constraint client_files_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'client_files_uploaded_by_fkey'
  ) then
    alter table public.client_files
      add constraint client_files_uploaded_by_fkey
      foreign key (uploaded_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_created_by_fkey'
  ) then
    alter table public.orders
      add constraint orders_created_by_fkey
      foreign key (created_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'app_user_sessions_user_id_fkey'
  ) then
    alter table public.app_user_sessions
      add constraint app_user_sessions_user_id_fkey
      foreign key (user_id) references public.app_users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'security_alerts_user_id_fkey'
  ) then
    alter table public.security_alerts
      add constraint security_alerts_user_id_fkey
      foreign key (user_id) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'password_recovery_requests_user_id_fkey'
  ) then
    alter table public.password_recovery_requests
      add constraint password_recovery_requests_user_id_fkey
      foreign key (user_id) references public.app_users(id) on delete cascade;
  end if;
end $$;
