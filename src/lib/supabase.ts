import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}
