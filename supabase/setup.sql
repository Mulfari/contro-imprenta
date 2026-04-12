create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  display_name text not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

create unique index if not exists app_users_username_idx
  on public.app_users (username);

alter table public.app_users enable row level security;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text null,
  phone text null,
  email text null,
  notes text null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

create index if not exists clients_created_at_idx
  on public.clients (created_at desc);

alter table public.clients enable row level security;

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
