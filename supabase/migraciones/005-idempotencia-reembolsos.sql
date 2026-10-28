-- Evita notas duplicadas cuando Stripe reenvía un evento de reembolso parcial.
-- No modifica pedidos ni eventos anteriores, que no tienen stripe_event_id.
create unique index if not exists order_events_stripe_refund_event_key
  on public.order_events ((data ->> 'stripe_event_id'))
  where actor = 'stripe' and kind = 'pago' and data ? 'stripe_event_id';
