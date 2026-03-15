import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-side Supabase instance using the public anon key.
 * Uses AsyncStorage for persisting Supabase auth sessions in React Native.
 *
 * Use this for client-side Supabase features such as:
 *   - Supabase Storage (file uploads/downloads)
 *   - Supabase Realtime (subscriptions)
 *   - Supabase Auth (if migrating from JWT later)
 *
 * NOTE: All existing API calls still go through Axios → Express backend.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});
