import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vistaDeConfirmacion } from '../src/lib/estado-confirmacion.ts';
import { createSessionToken, isValidSessionToken, SESSION_DURATION_SECONDS } from '../src/lib/admin-session.ts';

const sesion = (status, orderRecorded, orderStatus = null) => ({
  status,
  amountTotal: 100,
  orderRecorded,
  orderStatus,
});

test('un pago diferido no aparece como fallido', () => {
  assert.equal(vistaDeConfirmacion(sesion('unpaid', true, 'pending_payment')), 'pendiente');
  assert.equal(vistaDeConfirmacion(sesion('unpaid', false)), 'pendiente');
  assert.equal(vistaDeConfirmacion(sesion('unpaid', true, 'cancelled')), 'cancelado');
});

test('un cobro no se presenta como pedido hasta que esté registrado', () => {
  assert.equal(vistaDeConfirmacion(sesion('paid', false)), 'registrando');
  assert.equal(vistaDeConfirmacion(sesion('paid', true, 'pending_payment')), 'registrando');
  assert.equal(vistaDeConfirmacion(sesion('paid', true, 'received')), 'registrado');
  assert.equal(vistaDeConfirmacion(sesion('paid', true, 'refunded')), 'reembolsado');
  assert.equal(vistaDeConfirmacion(null), 'sin_verificar');
});

test('la sesión administrativa caduca y no acepta tokens alterados', () => {
  const now = Date.UTC(2026, 9, 27);
  const secret = 'solo-para-la-prueba';
  const token = createSessionToken(now, secret);
  assert.equal(isValidSessionToken(token, now, secret), true);
  assert.equal(isValidSessionToken(token, now + SESSION_DURATION_SECONDS * 1000, secret), true);
  assert.equal(isValidSessionToken(token, now + (SESSION_DURATION_SECONDS + 1) * 1000, secret), false);
  assert.equal(isValidSessionToken(token, now - 1000, secret), false);
  assert.equal(isValidSessionToken(token + '.extra', now, secret), false);
  assert.equal(isValidSessionToken(token.replace('admin:', 'other:'), now, secret), false);
});
