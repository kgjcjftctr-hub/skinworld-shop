-- Pedidos con MEPIEL: etapas, historial y productos de cada pedido. Se pega una
-- sola vez en Supabase → SQL Editor → Run, DESPUÉS de 002-productos-proveedor.sql.
-- Todo va en una transacción: si algo falla, no queda nada a medias.
--
-- Qué cambia:
--   · Las etapas pasan a ser nueve (ver orders_status_check). Los pedidos que
--     estaban «paid» quedan como «received» y los «packed» como «preparing».
--   · order_items: cada producto del pedido en su propio renglón, con el código
--     de MEPIEL, la disponibilidad que confirmó MEPIEL y si ya se le compró.
--   · order_events: historial de cada pedido. Cada cambio de etapa, de
--     disponibilidad, de compra o de guía deja su renglón en la misma
--     transacción que el cambio, así que no se puede uno sin el otro.
--   · Funciones que hacen esos cambios con sus reglas. Sólo las puede llamar el
--     servidor de la tienda (llave de servicio); el público no.
--
-- La tienda sigue funcionando antes de correr esto: el panel avisa que falta y
-- no deja hacer los cambios nuevos.

begin;

-- 1 · Etapas -----------------------------------------------------------------

update public.orders set status = 'received'  where status = 'paid';
update public.orders set status = 'preparing' where status = 'packed';

alter table public.orders alter column status set default 'received';
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in (
  'pending_payment',    -- Pago pendiente: el cliente terminó, el pago aún no se acredita
  'received',           -- Recibido: pagado, nadie lo ha trabajado
  'awaiting_supplier',  -- Por confirmar con MEPIEL: ya se le preguntó a MEPIEL
  'confirmed',          -- Confirmado: MEPIEL confirmó todos los productos
  'preparing',          -- En preparación: comprado y en camino a empaquetarse
  'shipped',            -- Enviado
  'delivered',          -- Entregado
  'cancelled',          -- Cancelado
  'refunded'            -- Reembolsado
));

alter table public.orders
  add column if not exists stripe_payment_intent text,
  add column if not exists status_updated_at     timestamptz,
  add column if not exists confirmed_at          timestamptz,
  add column if not exists cancelled_at          timestamptz,
  add column if not exists refunded_at           timestamptz;

comment on column public.orders.packed_at is 'Momento en que el pedido pasó a «En preparación».';

-- Un pago de Stripe sólo puede crear un pedido, aunque el aviso llegue dos veces
-- al mismo tiempo.
create unique index if not exists orders_stripe_session_id_key on public.orders (stripe_session_id);
create index if not exists orders_payment_intent_idx on public.orders (stripe_payment_intent);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Los pedidos traen nombre, dirección y teléfono: sólo el servidor los lee.
alter table public.orders enable row level security;

-- 2 · Productos de cada pedido ------------------------------------------------

create table if not exists public.order_items (
  id                  bigint generated always as identity primary key,
  order_id            uuid not null references public.orders (id) on delete cascade,
  position            int  not null,
  product_id          text references public.products (id) on delete set null,
  name                text not null,                      -- nombre con el que se cobró
  quantity            int  not null check (quantity > 0),
  amount_total        numeric(12, 2) not null default 0,  -- lo que pagó el cliente por el renglón
  supplier            text,                               -- 'MEPIEL' cuando el producto está relacionado
  supplier_code       text,                               -- código MEPIEL al momento de la compra
  presentation        text,
  availability        text not null default 'sin_revisar'
                      check (availability in ('sin_revisar', 'disponible', 'no_disponible')),
  availability_at     timestamptz,
  purchased_at        timestamptz,                        -- cuándo se confirmó la compra a MEPIEL
  supplier_order_ref  text,                               -- folio o referencia de esa compra
  unique (order_id, position),
  check (purchased_at is null or availability = 'disponible')
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_supplier_code_idx on public.order_items (supplier, supplier_code);

alter table public.order_items enable row level security;

-- 3 · Historial ----------------------------------------------------------------

create table if not exists public.order_events (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  created_at   timestamptz not null default now(),
  kind         text not null check (kind in ('estado', 'disponibilidad', 'compra', 'guia', 'correo', 'pago', 'nota')),
  from_status  text,
  to_status    text,
  actor        text not null,          -- 'tienda' (panel), 'stripe' (webhook) o 'sistema'
  note         text,
  data         jsonb not null default '{}'::jsonb
);

create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

alter table public.order_events enable row level security;

-- 4 · Pedidos que ya existían -----------------------------------------------------

-- Sus productos se pasan a order_items. El producto se relaciona sólo cuando el
-- nombre coincide con un único producto de la tienda; si no, queda sin relacionar
-- y el panel lo muestra así, en vez de adivinar.
insert into public.order_items (order_id, position, product_id, name, quantity, amount_total, supplier, supplier_code, presentation)
select o.id,
       e.ord::int,
       p.id,
       e.x ->> 'name',
       greatest(coalesce((e.x ->> 'quantity')::int, 1), 1),
       coalesce((e.x ->> 'amount_total')::numeric, 0),
       ps.supplier,
       ps.supplier_code,
       ps.presentation
from public.orders o
cross join lateral jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) with ordinality as e(x, ord)
left join lateral (
  select min(pr.id) as id from public.products pr where pr.name = e.x ->> 'name' having count(*) = 1
) p on true
left join public.product_suppliers ps on ps.product_id = p.id and ps.supplier = 'MEPIEL'
where e.x ->> 'name' is distinct from 'Envío'
  and not exists (select 1 from public.order_items i where i.order_id = o.id);

insert into public.order_events (order_id, created_at, kind, to_status, actor, note)
select o.id, o.created_at, 'estado', o.status, 'sistema',
       'Pedido anterior al historial: sólo se conoce la etapa en la que estaba al activarlo.'
from public.orders o
where not exists (select 1 from public.order_events ev where ev.order_id = o.id);

-- 5 · Reglas de cambio de etapa ---------------------------------------------------
-- Copia de TRANSICIONES en src/lib/estados-pedido.ts: si cambia una, cambia la otra.

create or replace function public.transicion_permitida(p_de text, p_a text)
returns boolean
language sql
immutable
as $$
  select (p_de, p_a) in (values
    ('pending_payment', 'received'), ('pending_payment', 'cancelled'),
    ('received', 'awaiting_supplier'), ('received', 'cancelled'), ('received', 'refunded'),
    ('awaiting_supplier', 'confirmed'), ('awaiting_supplier', 'cancelled'), ('awaiting_supplier', 'refunded'),
    ('confirmed', 'preparing'), ('confirmed', 'cancelled'), ('confirmed', 'refunded'),
    ('preparing', 'shipped'), ('preparing', 'cancelled'), ('preparing', 'refunded'),
    ('shipped', 'delivered'), ('shipped', 'refunded'),
    ('delivered', 'refunded'),
    ('cancelled', 'refunded')
  );
$$;

-- 6 · Registrar un pedido nuevo (lo llama el webhook de Stripe) -------------------

create or replace function public.registrar_pedido(p_pedido jsonb, p_articulos jsonb, p_actor text default 'stripe')
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v public.orders;
begin
  if coalesce(p_pedido ->> 'status', '') not in ('pending_payment', 'received') then
    raise exception 'ESTADO_INICIAL_INVALIDO';
  end if;

  insert into public.orders (stripe_session_id, stripe_payment_intent, customer_email, customer_phone,
                             shipping_name, shipping_address, amount_total, currency, status, items, status_updated_at)
  values (p_pedido ->> 'stripe_session_id',
          p_pedido ->> 'stripe_payment_intent',
          p_pedido ->> 'customer_email',
          p_pedido ->> 'customer_phone',
          p_pedido ->> 'shipping_name',
          p_pedido -> 'shipping_address',
          (p_pedido ->> 'amount_total')::numeric,
          coalesce(p_pedido ->> 'currency', 'mxn'),
          p_pedido ->> 'status',
          coalesce(p_pedido -> 'items', '[]'::jsonb),
          now())
  on conflict (stripe_session_id) do nothing
  returning * into v;

  -- Stripe mandó el mismo aviso otra vez: el pedido ya existe y no se toca.
  if v.id is null then
    select * into v from public.orders where stripe_session_id = p_pedido ->> 'stripe_session_id';
    return jsonb_build_object('nuevo', false, 'pedido', to_jsonb(v));
  end if;

  insert into public.order_items (order_id, position, product_id, name, quantity, amount_total, supplier, supplier_code, presentation)
  select v.id,
         a.ord::int,
         pr.id,
         a.x ->> 'name',
         greatest(coalesce((a.x ->> 'quantity')::int, 1), 1),
         coalesce((a.x ->> 'amount_total')::numeric, 0),
         ps.supplier,
         ps.supplier_code,
         coalesce(ps.presentation, nullif(a.x ->> 'presentation', ''))
  from jsonb_array_elements(coalesce(p_articulos, '[]'::jsonb)) with ordinality as a(x, ord)
  left join public.products pr on pr.id = a.x ->> 'product_id'
  left join public.product_suppliers ps on ps.product_id = pr.id and ps.supplier = 'MEPIEL';

  insert into public.order_events (order_id, kind, to_status, actor)
  values (v.id, 'estado', v.status, p_actor);

  return jsonb_build_object('nuevo', true, 'pedido', to_jsonb(v));
end;
$$;

-- 7 · Cambiar de etapa -------------------------------------------------------------
-- p_de es la etapa que el panel estaba viendo. Si otra pestaña o un doble clic ya
-- lo movió, el segundo intento falla en vez de repetir el cambio y el correo.

create or replace function public.cambiar_estado_pedido(
  p_pedido   uuid,
  p_de       text,
  p_a        text,
  p_actor    text,
  p_nota     text default null,
  p_guia     text default null,
  p_guia_url text default null
)
returns public.orders
language plpgsql
set search_path = public
as $$
declare
  v       public.orders;
  v_nota  text := nullif(btrim(coalesce(p_nota, '')), '');
  v_guia  text := nullif(btrim(coalesce(p_guia, '')), '');
  v_total int;
  v_faltan int;
begin
  select * into v from public.orders where id = p_pedido for update;
  if not found then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v.status is distinct from p_de then raise exception 'ESTADO_CAMBIO:%', v.status; end if;
  if not public.transicion_permitida(p_de, p_a) then raise exception 'TRANSICION_NO_PERMITIDA'; end if;

  select count(*),
         count(*) filter (where (p_a = 'confirmed' and availability <> 'disponible')
                             or (p_a = 'preparing' and purchased_at is null))
    into v_total, v_faltan
  from public.order_items where order_id = p_pedido;

  if p_a in ('confirmed', 'preparing') and v_total = 0 then raise exception 'SIN_ARTICULOS'; end if;
  if p_a = 'confirmed' and v_faltan > 0 then raise exception 'FALTA_DISPONIBILIDAD:%', v_faltan; end if;
  if p_a = 'preparing' and v_faltan > 0 then raise exception 'FALTA_COMPRA:%', v_faltan; end if;
  if p_a = 'shipped' and coalesce(v_guia, v.tracking) is null and v_nota is null then
    raise exception 'FALTA_GUIA';
  end if;
  if p_a in ('cancelled', 'refunded') and v_nota is null and p_actor = 'tienda' then
    raise exception 'FALTA_MOTIVO';
  end if;

  update public.orders set
    status            = p_a,
    status_updated_at = now(),
    confirmed_at      = case when p_a = 'confirmed' then now() else confirmed_at end,
    packed_at         = case when p_a = 'preparing' then now() else packed_at end,
    shipped_at        = case when p_a = 'shipped'   then now() else shipped_at end,
    delivered_at      = case when p_a = 'delivered' then now() else delivered_at end,
    cancelled_at      = case when p_a = 'cancelled' then now() else cancelled_at end,
    refunded_at       = case when p_a = 'refunded'  then now() else refunded_at end,
    tracking          = case when p_a = 'shipped' and v_guia is not null then v_guia else tracking end,
    tracking_url      = case when p_a = 'shipped' and v_guia is not null then p_guia_url else tracking_url end
  where id = p_pedido
  returning * into v;

  insert into public.order_events (order_id, kind, from_status, to_status, actor, note, data)
  values (p_pedido, 'estado', p_de, p_a, p_actor, v_nota,
          case when p_a = 'shipped' and v_guia is not null then jsonb_build_object('guia', v_guia) else '{}'::jsonb end);

  return v;
end;
$$;

-- 8 · Capturar o corregir la guía sin cambiar de etapa ----------------------------

create or replace function public.actualizar_guia_pedido(
  p_pedido   uuid,
  p_guia     text,
  p_guia_url text,
  p_actor    text
)
returns public.orders
language plpgsql
set search_path = public
as $$
declare
  v      public.orders;
  v_guia text := nullif(btrim(coalesce(p_guia, '')), '');
begin
  select * into v from public.orders where id = p_pedido for update;
  if not found then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v.status not in ('preparing', 'shipped', 'delivered') then raise exception 'GUIA_FUERA_DE_ETAPA:%', v.status; end if;
  if v_guia is null then raise exception 'FALTA_GUIA'; end if;
  if v_guia = v.tracking then return v; end if;

  insert into public.order_events (order_id, kind, actor, data)
  values (p_pedido, 'guia', p_actor, jsonb_build_object('guia', v_guia, 'anterior', v.tracking));

  update public.orders set tracking = v_guia, tracking_url = p_guia_url
  where id = p_pedido
  returning * into v;

  return v;
end;
$$;

-- 9 · Disponibilidad y compra de productos ------------------------------------------
-- Se usa desde la vista de compra a MEPIEL: un producto puede ir en varios pedidos y
-- se marcan todos sus renglones de una vez. Cada pedido afectado recibe su renglón
-- de historial con lo que cambió. Un renglón que ya estaba así no genera historial.

create or replace function public.actualizar_articulos_pedido(
  p_articulos      bigint[],
  p_disponibilidad text    default null,
  p_comprado       boolean default null,
  p_folio          text    default null,
  p_actor          text    default 'tienda',
  p_nota           text    default null
)
returns setof public.order_items
language plpgsql
set search_path = public
as $$
declare
  v_folio  text := nullif(btrim(coalesce(p_folio, '')), '');
  v_nota   text := nullif(btrim(coalesce(p_nota, '')), '');
  v_estado text;
begin
  if p_disponibilidad is null and p_comprado is null then raise exception 'SIN_CAMBIOS'; end if;
  if p_disponibilidad is not null and p_disponibilidad not in ('sin_revisar', 'disponible', 'no_disponible') then
    raise exception 'DISPONIBILIDAD_INVALIDA';
  end if;
  if coalesce(cardinality(p_articulos), 0) = 0 then raise exception 'SIN_ARTICULOS'; end if;
  if (select count(*) from public.order_items where id = any (p_articulos)) <> cardinality(p_articulos) then
    raise exception 'ARTICULO_NO_EXISTE';
  end if;

  -- Bloquea los pedidos involucrados para que dos cambios no se crucen.
  perform 1 from public.orders
  where id in (select order_id from public.order_items where id = any (p_articulos))
  order by id
  for update;

  select o.status into v_estado
  from public.orders o join public.order_items i on i.order_id = o.id
  where i.id = any (p_articulos)
    and o.status not in ('received', 'awaiting_supplier', 'confirmed', 'preparing')
  limit 1;
  if v_estado is not null then raise exception 'PEDIDO_CERRADO:%', v_estado; end if;

  -- No se puede comprar lo que MEPIEL no confirmó, ni quitarle la disponibilidad
  -- a algo que ya se compró sin deshacer antes la compra.
  if p_comprado is true and exists (
    select 1 from public.order_items
    where id = any (p_articulos) and coalesce(p_disponibilidad, availability) <> 'disponible'
  ) then
    raise exception 'COMPRA_SIN_DISPONIBILIDAD';
  end if;
  if p_disponibilidad is not null and p_disponibilidad <> 'disponible' and p_comprado is distinct from false and exists (
    select 1 from public.order_items where id = any (p_articulos) and purchased_at is not null
  ) then
    raise exception 'YA_COMPRADO';
  end if;

  insert into public.order_events (order_id, kind, actor, note, data)
  select i.order_id,
         case when p_comprado is not null then 'compra' else 'disponibilidad' end,
         p_actor,
         v_nota,
         jsonb_strip_nulls(jsonb_build_object(
           'disponibilidad', p_disponibilidad,
           'comprado', p_comprado,
           'folio', case when p_comprado then v_folio end,
           'articulos', jsonb_agg(jsonb_build_object(
             'id', i.id, 'nombre', i.name, 'cantidad', i.quantity, 'codigo', i.supplier_code) order by i.position)
         ))
  from public.order_items i
  where i.id = any (p_articulos)
    and (   (p_disponibilidad is not null and i.availability is distinct from p_disponibilidad)
         or (p_comprado is true  and (i.purchased_at is null or v_folio is distinct from i.supplier_order_ref))
         or (p_comprado is false and i.purchased_at is not null))
  group by i.order_id;

  -- Lo que MEPIEL contestó queda también en el producto, para la siguiente venta.
  if p_disponibilidad in ('disponible', 'no_disponible') then
    update public.product_suppliers ps set
      availability            = case when p_disponibilidad = 'disponible' then 'disponible' else 'agotado' end,
      availability_checked_at = now(),
      updated_at              = now()
    from public.order_items i
    where i.id = any (p_articulos)
      and ps.product_id = i.product_id
      and ps.supplier = coalesce(i.supplier, 'MEPIEL');
  end if;

  return query
  update public.order_items i set
    availability       = coalesce(p_disponibilidad, i.availability),
    availability_at    = case when p_disponibilidad is not null and p_disponibilidad is distinct from i.availability
                              then now() else i.availability_at end,
    purchased_at       = case when p_comprado is true  then coalesce(i.purchased_at, now())
                              when p_comprado is false then null
                              else i.purchased_at end,
    supplier_order_ref = case when p_comprado is true  then coalesce(v_folio, i.supplier_order_ref)
                              when p_comprado is false then null
                              else i.supplier_order_ref end
  where i.id = any (p_articulos)
  returning i.*;
end;
$$;

-- 10 · Nadie más que el servidor puede llamar estas funciones -----------------------
-- Supabase deja ejecutar cualquier función nueva a los visitantes anónimos; sin
-- esto, alguien podría cambiar la etapa de un pedido con la llave pública.

revoke all on function public.registrar_pedido(jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.cambiar_estado_pedido(uuid, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.actualizar_guia_pedido(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.actualizar_articulos_pedido(bigint[], text, boolean, text, text, text) from public, anon, authenticated;

grant execute on function public.registrar_pedido(jsonb, jsonb, text) to service_role;
grant execute on function public.cambiar_estado_pedido(uuid, text, text, text, text, text, text) to service_role;
grant execute on function public.actualizar_guia_pedido(uuid, text, text, text) to service_role;
grant execute on function public.actualizar_articulos_pedido(bigint[], text, boolean, text, text, text) to service_role;

commit;
