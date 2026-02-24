import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export const supabaseAdmin =
  url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;

