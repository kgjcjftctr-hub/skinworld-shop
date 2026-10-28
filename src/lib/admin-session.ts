import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createSessionToken(now = Date.now(), secret = process.env.ADMIN_SESSION_SECRET!) {
  const payload = `admin:${Math.floor(now / 1000)}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidSessionToken(
  token: string | undefined | null,
  now = Date.now(),
  secret = process.env.ADMIN_SESSION_SECRET!
) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const match = /^admin:(\d{10})$/.exec(payload);
  if (!match || !sig) return false;
  const issuedAt = Number(match[1]);
  const current = Math.floor(now / 1000);
  if (issuedAt > current || current - issuedAt > SESSION_DURATION_SECONDS) return false;

  const expected = Buffer.from(sign(payload, secret));
  const supplied = Buffer.from(sig);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
