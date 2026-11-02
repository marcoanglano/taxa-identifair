import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_0_7_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_0_7_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
