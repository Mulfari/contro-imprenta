alter table public.orders add column if not exists rejected_by uuid null;
alter table public.orders add column if not exists rejected_at timestamptz null;
alter table public.orders add column if not exists rejection_reason text null;

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (
    status in (
      'recibido',
      'disenando',
      'imprimiendo',
      'listo',
      'entregado',
      'rechazado'
    )
  )
  not valid;

create index if not exists orders_rejected_at_idx
  on public.orders (rejected_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_rejected_by_fkey'
  ) then
    alter table public.orders
      add constraint orders_rejected_by_fkey
      foreign key (rejected_by)
      references public.app_users(id)
      on delete set null;
  end if;
end $$;
