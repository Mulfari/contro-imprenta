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

alter table public.app_users add column if not exists username text;
alter table public.app_users add column if not exists display_name text;
alter table public.app_users add column if not exists password_hash text;
alter table public.app_users add column if not exists role text;
alter table public.app_users add column if not exists is_active boolean default true;
alter table public.app_users add column if not exists created_at timestamptz default now();
alter table public.app_users add column if not exists created_by uuid null;

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

alter table public.clients add column if not exists name text;
alter table public.clients add column if not exists contact_name text null;
alter table public.clients add column if not exists phone text null;
alter table public.clients add column if not exists email text null;
alter table public.clients add column if not exists notes text null;
alter table public.clients add column if not exists created_at timestamptz default now();
alter table public.clients add column if not exists created_by uuid null;

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
    where conname = 'orders_created_by_fkey'
  ) then
    alter table public.orders
      add constraint orders_created_by_fkey
      foreign key (created_by) references public.app_users(id) on delete set null;
  end if;
end $$;
