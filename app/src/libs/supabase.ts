import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublicKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY;

if (!supabaseUrl) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL in environment variables.");
}

if (!supabasePublicKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_PUBLIC_KEY in environment variables.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
