-- Solicitudes de factura. Se pega una sola vez en Supabase → SQL Editor → Run,
-- DESPUÉS de 003-pedidos-mepiel.sql. Todo va en una transacción.
--
-- El cliente llena el formulario de /facturacion con la referencia de su pedido
-- y el correo con el que compró; si coinciden y está en plazo, la solicitud se
-- guarda aquí. La factura (CFDI) la emite la tienda con su sistema de facturación
-- y la sube en el panel, que se la manda al cliente por correo.
--
-- La tienda sigue funcionando antes de correr esto: el formulario pide escribir
-- a contacto@skinworld.shop y el panel avisa que falta.

begin;

create table if not exists public.invoice_requests (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  created_at      timestamptz not null default now(),
  email           text not null,
  rfc             text not null check (rfc ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
  razon_social    text not null check (length(btrim(razon_social)) between 1 and 300),
  regimen_fiscal  text not null check (regimen_fiscal ~ '^[0-9]{3}$'),
  codigo_postal   text not null check (codigo_postal ~ '^[0-9]{5}$'),
  uso_cfdi        text not null check (uso_cfdi ~ '^[A-Z]{1,2}[0-9]{2}$'),
  status          text not null default 'pendiente' check (status in ('pendiente', 'enviada', 'rechazada')),
  resolved_at     timestamptz,                -- cuándo se envió o rechazó
  note            text                        -- motivo del rechazo, si lo hubo
);

-- Un pedido sólo puede tener una solicitud abierta o enviada a la vez.
create unique index if not exists invoice_requests_pedido_activo
  on public.invoice_requests (order_id) where status <> 'rechazada';
create index if not exists invoice_requests_status_idx on public.invoice_requests (status, created_at desc);

-- Trae RFC, razón social y correo: sólo el servidor la lee.
alter table public.invoice_requests enable row level security;

-- El historial del pedido también registra lo que pasa con su factura.
alter table public.order_events drop constraint if exists order_events_kind_check;
alter table public.order_events add constraint order_events_kind_check
  check (kind in ('estado', 'disponibilidad', 'compra', 'guia', 'correo', 'pago', 'nota', 'factura'));

-- Busca el pedido por los 8 caracteres de su referencia y el correo con que se
-- compró, revisa que se pueda facturar y guarda la solicitud.
create or replace function public.solicitar_factura(p_referencia text, p_correo text, p_datos jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v       public.orders;
  v_n     int;
  v_id    uuid;
  v_zona  constant text := 'America/Mexico_City';
begin
  select count(*) into v_n from public.orders
  where left(id::text, 8) = lower(btrim(p_referencia))
    and lower(customer_email) = lower(btrim(p_correo));
  if v_n <> 1 then raise exception 'PEDIDO_NO_ENCONTRADO'; end if;

  select * into v from public.orders
  where left(id::text, 8) = lower(btrim(p_referencia))
    and lower(customer_email) = lower(btrim(p_correo))
  for update;

  if v.status in ('pending_payment', 'cancelled', 'refunded') then raise exception 'PEDIDO_NO_FACTURABLE:%', v.status; end if;
  -- La factura se pide en el mismo mes de la compra (hora del centro de México).
  if date_trunc('month', v.created_at at time zone v_zona) <> date_trunc('month', now() at time zone v_zona) then
    raise exception 'FUERA_DE_PLAZO';
  end if;
  if exists (select 1 from public.invoice_requests where order_id = v.id and status <> 'rechazada') then
    raise exception 'YA_SOLICITADA';
  end if;

  insert into public.invoice_requests (order_id, email, rfc, razon_social, regimen_fiscal, codigo_postal, uso_cfdi)
  values (v.id, lower(btrim(p_correo)), upper(btrim(p_datos ->> 'rfc')), btrim(p_datos ->> 'razon_social'),
          p_datos ->> 'regimen_fiscal', p_datos ->> 'codigo_postal', p_datos ->> 'uso_cfdi')
  returning id into v_id;

  insert into public.order_events (order_id, kind, actor, note)
  values (v.id, 'factura', 'sistema', 'El cliente pidió factura.');

  return jsonb_build_object('solicitud', v_id, 'pedido', v.id);
end;
$$;

-- Cierra una solicitud (enviada o rechazada) y lo deja en el historial del pedido.
create or replace function public.resolver_factura(p_solicitud uuid, p_status text, p_actor text, p_nota text default null)
returns public.invoice_requests
language plpgsql
set search_path = public
as $$
declare
  v public.invoice_requests;
begin
  if p_status not in ('enviada', 'rechazada') then raise exception 'ESTADO_INVALIDO'; end if;
  if p_status = 'rechazada' and nullif(btrim(coalesce(p_nota, '')), '') is null then raise exception 'FALTA_MOTIVO'; end if;

  select * into v from public.invoice_requests where id = p_solicitud for update;
  if not found then raise exception 'SOLICITUD_NO_EXISTE'; end if;
  if v.status <> 'pendiente' then raise exception 'SOLICITUD_CERRADA:%', v.status; end if;

  update public.invoice_requests
  set status = p_status, resolved_at = now(), note = nullif(btrim(coalesce(p_nota, '')), '')
  where id = p_solicitud
  returning * into v;

  insert into public.order_events (order_id, kind, actor, note)
  values (v.order_id, 'factura', p_actor,
          case when p_status = 'enviada' then 'Factura enviada al cliente.' else 'Solicitud de factura rechazada: ' || v.note end);

  return v;
end;
$$;

revoke all on function public.solicitar_factura(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.resolver_factura(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.solicitar_factura(text, text, jsonb) to service_role;
grant execute on function public.resolver_factura(uuid, text, text, text) to service_role;

commit;
