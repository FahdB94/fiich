import { createClient } from '@supabase/supabase-js';

// Create a supabase client for the browser. It reads the public URL and anon key
// from environment variables. These variables must be defined at build time
// (for example via Vercel project settings).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);