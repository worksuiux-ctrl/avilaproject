import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { projectId, publicAnonKey } from "./info";

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = publicAnonKey;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js-web",
    },
  },
});
