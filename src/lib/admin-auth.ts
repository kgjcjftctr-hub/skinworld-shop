import 'server-only';
import { cookies } from 'next/headers';
import { isValidSessionToken } from '@/lib/admin-session';

export { createSessionToken, isValidSessionToken } from '@/lib/admin-session';

export const ADMIN_COOKIE_NAME = 'skinworld_admin_session';
export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}
