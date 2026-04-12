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
