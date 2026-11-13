import { createClient } from "@supabase/supabase-js";

const FALLBACK_URL = "https://fnveusfehznqeunjcmym.supabase.co";
const FALLBACK_KEY = "sb_publishable_UwkRcNPMRKKDpJXQic8dhA_x1JNDQHU";

export const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;
export const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
