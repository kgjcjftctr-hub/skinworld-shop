import { Suspense } from 'react';
import { OrderConfirmedClient } from './order-confirmed-client';

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmedClient />
    </Suspense>
  );
}
