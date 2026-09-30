-- Cambios de base de datos que la tienda no puede aplicar sola: la llave de
-- servicio que usa la aplicación puede leer y escribir datos, pero no crear ni
-- modificar tablas. Se pegan una sola vez en Supabase → SQL Editor → Run.
--
-- Hasta que esto se ejecute, la tienda funciona igual; lo que falta es guardar
-- el número de guía (SW-017) y mover los mensajes a una tabla (SW-019).

-- SW-017 · Número de guía y momentos de cada etapa del pedido ---------------
alter table public.orders
  add column if not exists tracking       text,
  add column if not exists tracking_url   text,
  add column if not exists packed_at      timestamptz,
  add column if not exists shipped_at     timestamptz,
  add column if not exists delivered_at   timestamptz;

comment on column public.orders.tracking is
  'Número de guía de la paquetería. Se captura al marcar el pedido como enviado.';

-- SW-019 · Mensajes de contacto y suscripciones al boletín ------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('contacto', 'boletin')),
  name        text,
  email       text not null,
  subject     text,
  body        text,
  created_at  timestamptz not null default now()
);

create index if not exists messages_kind_created_at_idx
  on public.messages (kind, created_at desc);

-- Un correo sólo puede estar suscrito una vez al boletín.
create unique index if not exists messages_boletin_email_idx
  on public.messages (lower(email)) where kind = 'boletin';

-- La tabla se lee y escribe sólo desde el servidor con la llave de servicio,
-- así que se deja sin acceso público.
alter table public.messages enable row level security;
