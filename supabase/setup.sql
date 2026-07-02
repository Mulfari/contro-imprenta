create extension if not exists pgcrypto;

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text null,
  phone text null,
  preferred_delivery_method text null check (preferred_delivery_method in ('pickup', 'delivery')),
  delivery_recipient_name text null,
  delivery_recipient_phone text null,
  delivery_address text null,
  account_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

alter table public.customer_profiles add column if not exists full_name text null;
alter table public.customer_profiles add column if not exists phone text null;
alter table public.customer_profiles add column if not exists preferred_delivery_method text null;
alter table public.customer_profiles add column if not exists delivery_recipient_name text null;
alter table public.customer_profiles add column if not exists delivery_recipient_phone text null;
alter table public.customer_profiles add column if not exists delivery_address text null;
alter table public.customer_profiles add column if not exists account_balance numeric(12,2) default 0;
alter table public.customer_profiles add column if not exists created_at timestamptz default now();
alter table public.customer_profiles add column if not exists updated_at timestamptz default now();
alter table public.customer_profiles alter column account_balance set default 0;
update public.customer_profiles
  set account_balance = 0
  where account_balance is null;
alter table public.customer_profiles alter column account_balance set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_profiles_preferred_delivery_method_check'
  ) then
    alter table public.customer_profiles
      add constraint customer_profiles_preferred_delivery_method_check
      check (preferred_delivery_method in ('pickup', 'delivery') or preferred_delivery_method is null);
  end if;
end $$;

create or replace function public.handle_customer_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_profiles_set_updated_at on public.customer_profiles;

create trigger customer_profiles_set_updated_at
before update on public.customer_profiles
for each row
execute function public.handle_customer_profile_updated_at();

create or replace function public.handle_new_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (id, full_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;

create trigger on_auth_user_created_customer_profile
after insert on auth.users
for each row
execute function public.handle_new_customer_profile();

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_profiles'
      and policyname = 'Customers can view own profile'
  ) then
    create policy "Customers can view own profile"
      on public.customer_profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_profiles'
      and policyname = 'Customers can update own profile'
  ) then
    create policy "Customers can update own profile"
      on public.customer_profiles
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

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

insert into storage.buckets (id, name, public, file_size_limit)
select 'order-files', 'order-files', false, 20971520
where not exists (
  select 1 from storage.buckets where id = 'order-files'
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid null references auth.users(id) on delete set null,
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
alter table public.clients add column if not exists customer_user_id uuid null;
alter table public.clients add column if not exists phone text null;
alter table public.clients add column if not exists email text null;
alter table public.clients add column if not exists document_id text null;
alter table public.clients add column if not exists address text null;
alter table public.clients add column if not exists preferred_branch text null;
alter table public.clients add column if not exists reference_files text null;
alter table public.clients add column if not exists notes text null;
alter table public.clients add column if not exists created_at timestamptz default now();
alter table public.clients add column if not exists created_by uuid null;

create unique index if not exists clients_customer_user_id_idx
  on public.clients (customer_user_id)
  where customer_user_id is not null;

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
  customer_user_id uuid null references auth.users(id) on delete set null,
  order_number text null,
  title text not null,
  product_type text null,
  description text null,
  quantity integer not null check (quantity > 0),
  measurements text null,
  material text null,
  size text null,
  lamination_finish text null,
  color_profile text null,
  includes_design boolean not null default false,
  includes_installation boolean not null default false,
  urgency text not null default 'normal' check (urgency in ('normal', 'prioritaria', 'express')),
  branch text null,
  quoted_price numeric(12,2) null,
  discount_amount numeric(12,2) null,
  status text not null check (status in ('recibido', 'disenando', 'imprimiendo', 'listo', 'entregado', 'rechazado')),
  total_amount numeric(12,2) null,
  deposit_amount numeric(12,2) null,
  pending_amount numeric(12,2) null,
  payment_method text null,
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente', 'anticipo', 'pagado', 'credito')),
  payment_review_status text not null default 'sin_pago' check (payment_review_status in ('sin_pago', 'por_validar', 'validado', 'rechazado')),
  confirmation_status text not null default 'pendiente' check (confirmation_status in ('pendiente', 'confirmado', 'rechazado')),
  source text not null default 'admin' check (source in ('admin', 'storefront')),
  promised_delivery_at date null,
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta', 'urgente')),
  current_owner text null,
  current_area text null,
  due_date date null,
  rejected_by uuid null references public.app_users(id) on delete set null,
  rejected_at timestamptz null,
  rejection_reason text null,
  internal_notes text null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

alter table public.orders enable row level security;

alter table public.orders add column if not exists client_id uuid null;
alter table public.orders add column if not exists customer_user_id uuid null;
alter table public.orders add column if not exists order_number text null;
alter table public.orders add column if not exists title text;
alter table public.orders add column if not exists product_type text null;
alter table public.orders add column if not exists description text null;
alter table public.orders add column if not exists quantity integer;
alter table public.orders add column if not exists measurements text null;
alter table public.orders add column if not exists material text null;
alter table public.orders add column if not exists size text null;
alter table public.orders add column if not exists lamination_finish text null;
alter table public.orders add column if not exists color_profile text null;
alter table public.orders add column if not exists includes_design boolean default false;
alter table public.orders add column if not exists includes_installation boolean default false;
alter table public.orders add column if not exists urgency text default 'normal';
alter table public.orders add column if not exists branch text null;
alter table public.orders add column if not exists quoted_price numeric(12,2) null;
alter table public.orders add column if not exists discount_amount numeric(12,2) null;
alter table public.orders add column if not exists due_date date null;
alter table public.orders add column if not exists status text;
alter table public.orders add column if not exists total_amount numeric(12,2) null;
alter table public.orders add column if not exists deposit_amount numeric(12,2) null;
alter table public.orders add column if not exists pending_amount numeric(12,2) null;
alter table public.orders add column if not exists payment_method text null;
alter table public.orders add column if not exists payment_status text default 'pendiente';
alter table public.orders add column if not exists payment_review_status text default 'sin_pago';
alter table public.orders add column if not exists confirmation_status text default 'pendiente';
alter table public.orders add column if not exists source text default 'admin';
alter table public.orders add column if not exists promised_delivery_at date null;
alter table public.orders add column if not exists priority text default 'media';
alter table public.orders add column if not exists current_owner text null;
alter table public.orders add column if not exists current_area text null;
alter table public.orders add column if not exists rejected_by uuid null;
alter table public.orders add column if not exists rejected_at timestamptz null;
alter table public.orders add column if not exists rejection_reason text null;
alter table public.orders add column if not exists internal_notes text null;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists created_by uuid null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'customer_id'
  ) then
    update public.orders
    set client_id = customer_id
    where client_id is null
      and customer_id is not null
      and exists (
        select 1
        from public.clients
        where clients.id = orders.customer_id
      );

    alter table public.orders
      alter column customer_id drop not null;
  end if;
end $$;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('recibido', 'disenando', 'imprimiendo', 'listo', 'entregado', 'rechazado'))
  not valid;

alter table public.orders drop constraint if exists orders_urgency_check;
alter table public.orders
  add constraint orders_urgency_check
  check (urgency in ('normal', 'prioritaria', 'express'))
  not valid;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pendiente', 'anticipo', 'pagado', 'credito'))
  not valid;

alter table public.orders drop constraint if exists orders_payment_review_status_check;
alter table public.orders
  add constraint orders_payment_review_status_check
  check (payment_review_status in ('sin_pago', 'por_validar', 'validado', 'rechazado'))
  not valid;

alter table public.orders drop constraint if exists orders_confirmation_status_check;
alter table public.orders
  add constraint orders_confirmation_status_check
  check (confirmation_status in ('pendiente', 'confirmado', 'rechazado'))
  not valid;

alter table public.orders drop constraint if exists orders_source_check;
alter table public.orders
  add constraint orders_source_check
  check (source in ('admin', 'storefront'))
  not valid;

alter table public.orders drop constraint if exists orders_priority_check;
alter table public.orders
  add constraint orders_priority_check
  check (priority in ('baja', 'media', 'alta', 'urgente'))
  not valid;

create index if not exists orders_customer_user_id_idx
  on public.orders (customer_user_id);

create index if not exists orders_payment_review_status_idx
  on public.orders (payment_review_status);

create index if not exists orders_rejected_at_idx
  on public.orders (rejected_at desc);

create unique index if not exists orders_order_number_idx
  on public.orders (order_number)
  where order_number is not null;

create table if not exists public.order_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  changed_by uuid null references public.app_users(id) on delete set null
);

create index if not exists order_history_order_id_idx
  on public.order_history (order_id);

create index if not exists order_history_created_at_idx
  on public.order_history (created_at desc);

alter table public.order_history enable row level security;

alter table public.order_history add column if not exists order_id uuid null;
alter table public.order_history add column if not exists event_type text;
alter table public.order_history add column if not exists detail text;
alter table public.order_history add column if not exists created_at timestamptz default now();
alter table public.order_history add column if not exists changed_by uuid null;

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  attachment_type text not null check (attachment_type in ('arte_cliente', 'prueba_aprobada', 'imagen_referencia', 'comprobante_pago')),
  file_name text not null,
  storage_path text not null unique,
  file_type text null,
  file_size bigint null,
  created_at timestamptz not null default now(),
  uploaded_by uuid null references public.app_users(id) on delete set null,
  customer_uploaded_by uuid null references auth.users(id) on delete set null
);

create index if not exists order_files_order_id_idx
  on public.order_files (order_id);

create index if not exists order_files_created_at_idx
  on public.order_files (created_at desc);

alter table public.order_files enable row level security;

alter table public.order_files add column if not exists order_id uuid null;
alter table public.order_files add column if not exists attachment_type text;
alter table public.order_files add column if not exists file_name text;
alter table public.order_files add column if not exists storage_path text;
alter table public.order_files add column if not exists file_type text null;
alter table public.order_files add column if not exists file_size bigint null;
alter table public.order_files add column if not exists created_at timestamptz default now();
alter table public.order_files add column if not exists uploaded_by uuid null;
alter table public.order_files add column if not exists customer_uploaded_by uuid null;

create table if not exists public.order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid null references public.orders(id) on delete cascade,
  customer_user_id uuid null references auth.users(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'pago_movil',
  bank text null,
  payer_phone text null,
  reference text null,
  status text not null default 'por_validar' check (status in ('por_validar', 'aprobado', 'rechazado')),
  purpose text not null default 'order_payment' check (purpose in ('order_payment', 'balance_topup')),
  proof_file_id uuid null references public.order_files(id) on delete set null,
  notes text null,
  reviewed_by uuid null references public.app_users(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.order_payments enable row level security;

alter table public.order_payments add column if not exists order_id uuid null;
alter table public.order_payments alter column order_id drop not null;
alter table public.order_payments add column if not exists customer_user_id uuid null;
alter table public.order_payments add column if not exists amount numeric(12,2);
alter table public.order_payments add column if not exists method text default 'pago_movil';
alter table public.order_payments add column if not exists bank text null;
alter table public.order_payments add column if not exists payer_phone text null;
alter table public.order_payments add column if not exists reference text null;
alter table public.order_payments add column if not exists status text default 'por_validar';
alter table public.order_payments add column if not exists purpose text default 'order_payment';
alter table public.order_payments add column if not exists proof_file_id uuid null;
alter table public.order_payments add column if not exists notes text null;
alter table public.order_payments add column if not exists reviewed_by uuid null;
alter table public.order_payments add column if not exists reviewed_at timestamptz null;
alter table public.order_payments add column if not exists created_at timestamptz default now();

create index if not exists order_payments_order_id_idx
  on public.order_payments (order_id);

create index if not exists order_payments_status_idx
  on public.order_payments (status);

create index if not exists order_payments_customer_user_id_idx
  on public.order_payments (customer_user_id);

create index if not exists order_payments_purpose_idx
  on public.order_payments (purpose);

create table if not exists public.customer_balance_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid null references public.orders(id) on delete set null,
  payment_id uuid null references public.order_payments(id) on delete set null,
  amount numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  transaction_type text not null check (transaction_type in ('order_debit', 'payment_credit', 'balance_topup', 'manual_adjustment')),
  description text not null,
  created_at timestamptz not null default now(),
  created_by uuid null references public.app_users(id) on delete set null
);

alter table public.customer_balance_transactions enable row level security;

alter table public.customer_balance_transactions add column if not exists customer_user_id uuid null;
alter table public.customer_balance_transactions add column if not exists order_id uuid null;
alter table public.customer_balance_transactions add column if not exists payment_id uuid null;
alter table public.customer_balance_transactions add column if not exists amount numeric(12,2);
alter table public.customer_balance_transactions add column if not exists balance_after numeric(12,2);
alter table public.customer_balance_transactions add column if not exists transaction_type text;
alter table public.customer_balance_transactions add column if not exists description text;
alter table public.customer_balance_transactions add column if not exists created_at timestamptz default now();
alter table public.customer_balance_transactions add column if not exists created_by uuid null;

create index if not exists customer_balance_transactions_customer_user_id_idx
  on public.customer_balance_transactions (customer_user_id);

create index if not exists customer_balance_transactions_created_at_idx
  on public.customer_balance_transactions (created_at desc);

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
    where conname = 'clients_customer_user_id_fkey'
  ) then
    alter table public.clients
      add constraint clients_customer_user_id_fkey
      foreign key (customer_user_id) references auth.users(id) on delete set null;
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
    where conname = 'orders_customer_user_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_user_id_fkey
      foreign key (customer_user_id) references auth.users(id) on delete set null;
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
    where conname = 'orders_rejected_by_fkey'
  ) then
    alter table public.orders
      add constraint orders_rejected_by_fkey
      foreign key (rejected_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_urgency_check'
  ) then
    alter table public.orders
      add constraint orders_urgency_check
      check (urgency in ('normal', 'prioritaria', 'express'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('pendiente', 'anticipo', 'pagado', 'credito'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_review_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_review_status_check
      check (payment_review_status in ('sin_pago', 'por_validar', 'validado', 'rechazado'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_confirmation_status_check'
  ) then
    alter table public.orders
      add constraint orders_confirmation_status_check
      check (confirmation_status in ('pendiente', 'confirmado', 'rechazado'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_source_check'
  ) then
    alter table public.orders
      add constraint orders_source_check
      check (source in ('admin', 'storefront'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_priority_check'
  ) then
    alter table public.orders
      add constraint orders_priority_check
      check (priority in ('baja', 'media', 'alta', 'urgente'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_history_order_id_fkey'
  ) then
    alter table public.order_history
      add constraint order_history_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_history_changed_by_fkey'
  ) then
    alter table public.order_history
      add constraint order_history_changed_by_fkey
      foreign key (changed_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_files_order_id_fkey'
  ) then
    alter table public.order_files
      add constraint order_files_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_files_uploaded_by_fkey'
  ) then
    alter table public.order_files
      add constraint order_files_uploaded_by_fkey
      foreign key (uploaded_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_files_customer_uploaded_by_fkey'
  ) then
    alter table public.order_files
      add constraint order_files_customer_uploaded_by_fkey
      foreign key (customer_uploaded_by) references auth.users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_files_attachment_type_check'
  ) then
    alter table public.order_files
      add constraint order_files_attachment_type_check
      check (attachment_type in ('arte_cliente', 'prueba_aprobada', 'imagen_referencia', 'comprobante_pago'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_order_id_fkey'
  ) then
    alter table public.order_payments
      add constraint order_payments_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_customer_user_id_fkey'
  ) then
    alter table public.order_payments
      add constraint order_payments_customer_user_id_fkey
      foreign key (customer_user_id) references auth.users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_proof_file_id_fkey'
  ) then
    alter table public.order_payments
      add constraint order_payments_proof_file_id_fkey
      foreign key (proof_file_id) references public.order_files(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_reviewed_by_fkey'
  ) then
    alter table public.order_payments
      add constraint order_payments_reviewed_by_fkey
      foreign key (reviewed_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_status_check'
  ) then
    alter table public.order_payments
      add constraint order_payments_status_check
      check (status in ('por_validar', 'aprobado', 'rechazado'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_amount_check'
  ) then
    alter table public.order_payments
      add constraint order_payments_amount_check
      check (amount > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'order_payments_purpose_check'
  ) then
    alter table public.order_payments
      add constraint order_payments_purpose_check
      check (purpose in ('order_payment', 'balance_topup'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_balance_transactions_customer_user_id_fkey'
  ) then
    alter table public.customer_balance_transactions
      add constraint customer_balance_transactions_customer_user_id_fkey
      foreign key (customer_user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_balance_transactions_order_id_fkey'
  ) then
    alter table public.customer_balance_transactions
      add constraint customer_balance_transactions_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_balance_transactions_payment_id_fkey'
  ) then
    alter table public.customer_balance_transactions
      add constraint customer_balance_transactions_payment_id_fkey
      foreign key (payment_id) references public.order_payments(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_balance_transactions_created_by_fkey'
  ) then
    alter table public.customer_balance_transactions
      add constraint customer_balance_transactions_created_by_fkey
      foreign key (created_by) references public.app_users(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customer_balance_transactions_transaction_type_check'
  ) then
    alter table public.customer_balance_transactions
      add constraint customer_balance_transactions_transaction_type_check
      check (transaction_type in ('order_debit', 'payment_credit', 'balance_topup', 'manual_adjustment'));
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

-- =====================================================================
-- Catalogo administrable (storefront)
-- Tablas product_categories y products, bucket de imagenes y semilla de
-- los 8 productos iniciales. Idempotente: se puede re-ejecutar sin romper.
-- =====================================================================

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.product_categories enable row level security;

create unique index if not exists product_categories_slug_idx
  on public.product_categories (slug);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text null,
  category text null,
  image_path text null,
  image_alt text null,
  tint text null,
  turnaround text null,
  highlights jsonb not null default '[]'::jsonb,
  pricing_mode text not null default 'package' check (pricing_mode in ('package', 'unit')),
  base_price numeric(12,2) not null default 0,
  design_fee numeric(12,2) not null default 0,
  requires_quote boolean not null default false,
  stock integer null,
  options jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Columnas idempotentes (por si la tabla ya existia con otra forma).
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists title text;
alter table public.products add column if not exists description text null;
alter table public.products add column if not exists category text null;
alter table public.products add column if not exists image_path text null;
alter table public.products add column if not exists image_alt text null;
alter table public.products add column if not exists tint text null;
alter table public.products add column if not exists turnaround text null;
alter table public.products add column if not exists highlights jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists pricing_mode text not null default 'package';
alter table public.products add column if not exists base_price numeric(12,2) not null default 0;
alter table public.products add column if not exists design_fee numeric(12,2) not null default 0;
alter table public.products add column if not exists requires_quote boolean not null default false;
alter table public.products add column if not exists stock integer;
alter table public.products add column if not exists options jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists sort_order integer not null default 0;
alter table public.products add column if not exists created_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();

create unique index if not exists products_slug_idx on public.products (slug);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_sort_order_idx on public.products (sort_order);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_pricing_mode_check'
  ) then
    alter table public.products
      add constraint products_pricing_mode_check
      check (pricing_mode in ('package', 'unit'));
  end if;
end $$;

create or replace function public.handle_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.handle_products_updated_at();

-- Bucket publico para fotos de productos subidas desde el panel.
insert into storage.buckets (id, name, public, file_size_limit)
select 'product-images', 'product-images', true, 5242880
where not exists (
  select 1 from storage.buckets where id = 'product-images'
);

-- Semilla de categorias.
insert into public.product_categories (name, slug, sort_order)
values
  ('Tarjetas de presentacion', 'tarjetas-de-presentacion', 1),
  ('Stickers y etiquetas', 'stickers-y-etiquetas', 2),
  ('Pendones y gran formato', 'pendones-y-gran-formato', 3),
  ('Facturas y talonarios', 'facturas-y-talonarios', 4),
  ('Invitaciones y papeleria', 'invitaciones-y-papeleria', 5)
on conflict (slug) do nothing;

-- Semilla de los 8 productos iniciales (no pisa cambios si ya existen).
insert into public.products
  (slug, title, description, category, image_path, image_alt, tint, turnaround, highlights, pricing_mode, base_price, options, is_active, sort_order)
values
  (
    'tarjetas-premium', 'Tarjetas premium',
    'Tarjetas de presentacion con acabado profesional para marcas, vendedores y equipos comerciales.',
    'Tarjetas de presentacion', '/storefront-promo-cards-premium.webp', 'Tarjetas premium impresas',
    'from-amber-100 via-white to-orange-50', '24 a 48 horas',
    '["Papel grueso","Acabado mate o brillante","Diseno listo para imprimir"]'::jsonb,
    'package', 18,
    '[{"name":"Cantidad","role":"package","values":[{"label":"100 unidades","amount":18},{"label":"250 unidades","amount":32},{"label":"500 unidades","amount":55}]},{"name":"Acabado","role":"surcharge","values":[{"label":"Mate","amount":0},{"label":"Brillante","amount":0},{"label":"Soft touch","amount":8}]}]'::jsonb,
    true, 1
  ),
  (
    'stickers-troquelados', 'Stickers troquelados',
    'Stickers con corte personalizado para empaques, promociones, frascos, bolsas y regalos.',
    'Stickers y etiquetas', '/storefront-promo-stickers-labels-trimmed.webp', 'Stickers troquelados personalizados',
    'from-sky-100 via-white to-cyan-50', '2 a 3 dias',
    '["Corte a la forma","Vinil adhesivo","Ideal para packaging"]'::jsonb,
    'package', 12,
    '[{"name":"Material","role":"package","values":[{"label":"Papel adhesivo","amount":12},{"label":"Vinil blanco","amount":18},{"label":"Vinil transparente","amount":22}]},{"name":"Corte","role":"surcharge","values":[{"label":"Circular","amount":0},{"label":"Cuadrado","amount":0},{"label":"Troquelado","amount":6}]}]'::jsonb,
    true, 2
  ),
  (
    'pendon-publicitario', 'Pendon publicitario',
    'Piezas de gran formato para promociones, vitrinas, ferias, eventos y puntos de venta.',
    'Pendones y gran formato', '/storefront-promo-banners-posters-transparent.webp', 'Pendones y afiches publicitarios',
    'from-violet-100 via-white to-fuchsia-50', '24 a 72 horas',
    '["Alta visibilidad","Listo para evento","Formatos personalizados"]'::jsonb,
    'package', 25,
    '[{"name":"Tamano","role":"package","values":[{"label":"60 x 160 cm","amount":25},{"label":"90 x 190 cm","amount":38},{"label":"Personalizado","amount":55}]},{"name":"Formato","role":"surcharge","values":[{"label":"Pendon","amount":0},{"label":"Afiche","amount":0},{"label":"Roll up","amount":20}]}]'::jsonb,
    true, 3
  ),
  (
    'talonarios-fiscales', 'Talonarios fiscales',
    'Talonarios, recibos y formatos comerciales para ventas, entregas y control administrativo.',
    'Facturas y talonarios', '/storefront-promo-invoices-receipts-transparent.webp', 'Talonarios y recibos impresos',
    'from-emerald-100 via-white to-lime-50', '2 a 4 dias',
    '["Numeracion disponible","Copias autocopiativas","Formato a medida"]'::jsonb,
    'package', 14,
    '[{"name":"Copias","role":"package","values":[{"label":"Original","amount":14},{"label":"Original + copia","amount":22},{"label":"Triplicado","amount":30}]},{"name":"Tipo","role":"surcharge","values":[{"label":"Recibo","amount":0},{"label":"Factura","amount":0},{"label":"Nota de entrega","amount":0}]}]'::jsonb,
    true, 4
  ),
  (
    'invitaciones-save-the-date', 'Invitaciones "Save the date"',
    'Invitaciones y papeleria social con una presentacion cuidada para eventos especiales.',
    'Invitaciones y papeleria', '/storefront-invitations.webp', 'Invitaciones impresas para eventos',
    'from-rose-100 via-white to-pink-50', '2 a 5 dias',
    '["Papeles finos","Corte limpio","Acabado premium"]'::jsonb,
    'package', 22,
    '[{"name":"Cantidad","role":"package","values":[{"label":"25 unidades","amount":22},{"label":"50 unidades","amount":38},{"label":"100 unidades","amount":65}]},{"name":"Papel","role":"surcharge","values":[{"label":"Opalina","amount":0},{"label":"Lino","amount":6},{"label":"Texturizado","amount":10}]}]'::jsonb,
    true, 5
  ),
  (
    'etiquetas-packaging', 'Etiquetas para packaging',
    'Etiquetas para productos, cajas, bolsas y empaques con opciones resistentes y llamativas.',
    'Stickers y etiquetas', '/storefront-labels.webp', 'Etiquetas para packaging',
    'from-cyan-100 via-white to-sky-50', '2 a 3 dias',
    '["Para productos","Por pliego o rollo","Colores vivos"]'::jsonb,
    'package', 11,
    '[{"name":"Entrega","role":"package","values":[{"label":"Pliego","amount":11},{"label":"Corte individual","amount":18},{"label":"Rollo","amount":24}]},{"name":"Acabado","role":"surcharge","values":[{"label":"Mate","amount":0},{"label":"Brillante","amount":0},{"label":"Laminado","amount":5}]}]'::jsonb,
    true, 6
  ),
  (
    'tarjetas-corporativas', 'Tarjetas corporativas',
    'Tarjetas para equipos comerciales con identidad consistente, buena lectura y presencia sobria.',
    'Tarjetas de presentacion', '/storefront-cards.webp', 'Tarjetas corporativas',
    'from-zinc-100 via-white to-slate-50', '24 a 48 horas',
    '["Paquetes por equipo","Marca corporativa","Revision de arte"]'::jsonb,
    'package', 20,
    '[{"name":"Cantidad","role":"package","values":[{"label":"250 unidades","amount":20},{"label":"500 unidades","amount":34},{"label":"1000 unidades","amount":60}]},{"name":"Acabado","role":"surcharge","values":[{"label":"Mate","amount":0},{"label":"Brillante","amount":0},{"label":"Laminado","amount":8}]}]'::jsonb,
    true, 7
  ),
  (
    'pendones-roll-up', 'Pendones roll up',
    'Pendones roll up con estructura para stands, ferias, vitrinas y presentaciones de marca.',
    'Pendones y gran formato', '/storefront-banners.webp', 'Pendones roll up',
    'from-yellow-100 via-white to-amber-50', '2 a 4 dias',
    '["Estructura incluida","Transportable","Alta presencia visual"]'::jsonb,
    'package', 39,
    '[{"name":"Medida","role":"package","values":[{"label":"80 x 200 cm","amount":39},{"label":"85 x 200 cm","amount":45},{"label":"Personalizada","amount":60}]},{"name":"Material","role":"surcharge","values":[{"label":"Lona","amount":0},{"label":"Banner premium","amount":10},{"label":"Vinil","amount":6}]}]'::jsonb,
    true, 8
  )
on conflict (slug) do nothing;

-- ============================================================
-- 12) Finanzas (fase 1a): tasa del día, cierres y movimientos
-- ============================================================

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  rate_date date not null unique,
  bs_per_usd numeric(14,4) not null check (bs_per_usd > 0),
  set_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.exchange_rates enable row level security;

create index if not exists exchange_rates_rate_date_idx
  on public.exchange_rates (rate_date desc);

create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  branch text not null,
  status text not null default 'abierta' check (status in ('abierta', 'cerrada')),
  opened_by uuid null references public.app_users(id) on delete set null,
  opened_at timestamptz not null default now(),
  opening_cash_usd numeric(12,2) not null default 0,
  opening_cash_ves numeric(14,2) not null default 0,
  closed_by uuid null references public.app_users(id) on delete set null,
  closed_at timestamptz null,
  counted_cash_usd numeric(12,2) null,
  counted_cash_ves numeric(14,2) null,
  expected_cash_usd numeric(12,2) null,
  expected_cash_ves numeric(14,2) null,
  notes text null,
  created_at timestamptz not null default now()
);

alter table public.cash_sessions enable row level security;

create index if not exists cash_sessions_branch_status_idx
  on public.cash_sessions (branch, status);

create index if not exists cash_sessions_opened_at_idx
  on public.cash_sessions (opened_at desc);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('ingreso', 'egreso')),
  amount_usd numeric(12,2) not null check (amount_usd > 0),
  currency_in text not null default 'USD' check (currency_in in ('USD', 'VES')),
  amount_in numeric(14,2) not null,
  exchange_rate numeric(14,4) null,
  method text not null,
  category text not null default 'venta',
  description text null,
  order_id uuid null references public.orders(id) on delete set null,
  client_id uuid null references public.clients(id) on delete set null,
  payment_id uuid null references public.order_payments(id) on delete set null,
  branch text null,
  cash_session_id uuid null references public.cash_sessions(id) on delete set null,
  created_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.cash_movements enable row level security;

create index if not exists cash_movements_created_at_idx
  on public.cash_movements (created_at desc);

create index if not exists cash_movements_type_idx
  on public.cash_movements (type);

create index if not exists cash_movements_session_idx
  on public.cash_movements (cash_session_id);

create index if not exists cash_movements_order_idx
  on public.cash_movements (order_id);

-- ============================================================
-- 13) Finanzas (fase 1b): presupuestos y facturas (IVA/IGTF)
-- ============================================================

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number bigint generated always as identity,
  client_id uuid null references public.clients(id) on delete set null,
  client_name text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal_usd numeric(12,2) not null check (subtotal_usd >= 0),
  valid_until date null,
  status text not null default 'enviado' check (status in ('borrador', 'enviado', 'aceptado', 'rechazado', 'convertido')),
  converted_order_id uuid null references public.orders(id) on delete set null,
  notes text null,
  created_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quotes_status_idx on public.quotes (status);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number bigint generated always as identity,
  order_id uuid null references public.orders(id) on delete set null,
  client_id uuid null references public.clients(id) on delete set null,
  client_name text not null,
  client_document text null,
  items jsonb not null default '[]'::jsonb,
  subtotal_usd numeric(12,2) not null check (subtotal_usd > 0),
  iva_rate numeric(6,4) not null default 0.16,
  iva_usd numeric(12,2) not null default 0,
  igtf_rate numeric(6,4) not null default 0.03,
  igtf_usd numeric(12,2) not null default 0,
  total_usd numeric(12,2) not null,
  exchange_rate numeric(14,4) null,
  status text not null default 'emitida' check (status in ('emitida', 'anulada')),
  notes text null,
  issued_by uuid null references public.app_users(id) on delete set null,
  issued_at timestamptz not null default now(),
  annulled_by uuid null references public.app_users(id) on delete set null,
  annulled_at timestamptz null
);

alter table public.invoices enable row level security;

create index if not exists invoices_issued_at_idx on public.invoices (issued_at desc);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_order_idx on public.invoices (order_id);

-- ============================================================
-- 14) Producción (fase 2c): aprobación de arte online
-- ============================================================

alter table public.orders add column if not exists art_approval_status text not null default 'sin_arte';
alter table public.orders add column if not exists art_approval_note text null;
alter table public.orders add column if not exists art_approval_at timestamptz null;

-- ============================================================
-- 15) Inventario (fase 3): insumos y movimientos de stock
-- ============================================================

create table if not exists public.supplies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'otros',
  unit text not null default 'unidad',
  stock numeric(14,2) not null default 0,
  min_stock numeric(14,2) not null default 0,
  cost_usd numeric(12,2) null,
  supplier text null,
  notes text null,
  is_active boolean not null default true,
  created_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.supplies enable row level security;

create index if not exists supplies_category_idx on public.supplies (category);
create index if not exists supplies_is_active_idx on public.supplies (is_active);

create table if not exists public.supply_movements (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid not null references public.supplies(id) on delete cascade,
  type text not null check (type in ('entrada', 'salida', 'ajuste')),
  quantity numeric(14,2) not null,
  stock_after numeric(14,2) not null,
  order_id uuid null references public.orders(id) on delete set null,
  cost_usd numeric(12,2) null,
  description text null,
  created_by uuid null references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.supply_movements enable row level security;

create index if not exists supply_movements_supply_idx on public.supply_movements (supply_id);
create index if not exists supply_movements_created_at_idx on public.supply_movements (created_at desc);
