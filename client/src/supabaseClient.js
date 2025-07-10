// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcepfndjsmktrfcelvgs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZXBmbmRqc21rdHJmY2VsdmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDA5MTYsImV4cCI6MjA2NjU3NjkxNn0.AkRngUqwyWjJV8Tz2nhn-auyX199TR39BHPyJ4OQ1MY';

// ✅ Create a single instance (prevents multiple GoTrueClient warnings)
let supabase;

if (!supabase) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
