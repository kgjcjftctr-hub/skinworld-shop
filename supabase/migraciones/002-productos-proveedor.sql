-- Datos internos de proveedor para cada producto (primero, MEPIEL). Se pega una
-- sola vez en Supabase → SQL Editor → Run, y después se corre
-- scripts/mepiel/importar-coincidencias.mjs.
--
-- Es una tabla aparte a propósito: las páginas públicas no la leen, así que
-- crearla, llenarla o borrarla no cambia nada de lo que ve el comprador (precio,
-- existencia, fichas). Aquí vive lo que el cliente nunca debe ver, como el costo
-- del proveedor. Para revertirlo basta con `drop table public.product_suppliers;`.
--
-- El precio de venta no se repite aquí: es products.price_with_iva, el mismo que
-- cobra el pago, para que no haya dos precios que se puedan contradecir.

create table if not exists public.product_suppliers (
  product_id             text not null references public.products (id) on delete cascade,
  supplier               text not null,              -- 'MEPIEL'
  supplier_code          text not null,              -- código SAP actual del proveedor
  previous_code          text,                       -- código SAP anterior, si cambió
  barcode                text,                       -- código de barras (EAN) actual
  previous_barcode       text,
  supplier_description   text not null,              -- nombre tal como viene en el catálogo
  supplier_lab           text,                       -- laboratorio según el proveedor
  supplier_brand         text,                       -- marca o línea según el proveedor
  supplier_status        text,                       -- ACTIVO, DESCONTINUADO, KIT ACTIVO…
  match_kind             text not null check (match_kind in ('codigo_de_barras', 'nombre_y_presentacion', 'probable', 'creado_desde_proveedor')),
  catalog_date           date,                       -- fecha del catálogo de donde salió el dato
  presentation           text,                       -- contenido del empaque (50 Ml, 30 Cápsulas…), sólo si viene en el nombre
  supplier_cost          numeric(12, 2) check (supplier_cost is null or supplier_cost > 0),
                                                     -- lo que el proveedor le cobra a Skinworld, con IVA; vacío si no hay lista
  supplier_cost_list     text,                       -- de qué lista salió el costo
  availability           text not null default 'sin_confirmar'
                         check (availability in ('sin_confirmar', 'disponible', 'agotado', 'descontinuado')),
  availability_checked_at timestamptz,               -- cuándo se confirmó por última vez con el proveedor
  updated_at             timestamptz not null default now(),
  primary key (product_id, supplier)
);

create index if not exists product_suppliers_code_idx on public.product_suppliers (supplier, supplier_code);
create index if not exists product_suppliers_barcode_idx on public.product_suppliers (barcode);

comment on table public.product_suppliers is
  'Datos internos de proveedor por producto: código, costo y disponibilidad confirmada. Nunca se muestran al cliente.';
comment on column public.product_suppliers.availability is
  'Lo que confirmó el proveedor al pedirle el producto. sin_confirmar = nadie lo ha preguntado todavía.';

-- Sólo el servidor (llave de servicio) la lee y escribe.
alter table public.product_suppliers enable row level security;
