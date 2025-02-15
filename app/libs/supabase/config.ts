import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://epqxqhjetxflplibxhwp.supabase.co";

// Anon public key, safe to expose to client (protected by RLS)
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXhxaGpldHhmbHBsaWJ4aHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4ODM5NzgsImV4cCI6MjA1NDQ1OTk3OH0.QeebA2SQcfzCvFyWeAC9Hikoqje9R3DvNOR7ggZN5wM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
