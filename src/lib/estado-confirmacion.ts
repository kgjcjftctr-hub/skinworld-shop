export interface EstadoDeSesion {
  status: string;
  amountTotal: number | null;
  orderRecorded: boolean;
  orderStatus: string | null;
}

export type VistaDeConfirmacion =
  | 'registrado'
  | 'registrando'
  | 'pendiente'
  | 'cancelado'
  | 'reembolsado'
  | 'sin_verificar';

export function vistaDeConfirmacion(info: EstadoDeSesion | null): VistaDeConfirmacion {
  if (!info) return 'sin_verificar';
  if (info.orderStatus === 'refunded') return 'reembolsado';
  if (info.orderStatus === 'cancelled') return 'cancelado';
  if (info.status === 'paid') {
    return info.orderRecorded && info.orderStatus !== 'pending_payment' ? 'registrado' : 'registrando';
  }
  if (info.status === 'unpaid') return 'pendiente';
  return 'sin_verificar';
}
