import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables."
  );
}

/**
 * Server-side Supabase client using the service role key.
 * Use this for admin operations (storage, realtime, edge functions, etc.).
 * NOTE: Database operations should continue using Prisma.
 */
<<<<<<< HEAD
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
=======
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
>>>>>>> 77804cf8de5c8111267738f15f9041d68d3e07b0
