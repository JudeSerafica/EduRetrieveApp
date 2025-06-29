import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcepfndjsmktrfcelvgs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZXBmbmRqc21rdHJmY2VsdmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDA5MTYsImV4cCI6MjA2NjU3NjkxNn0.AkRngUqwyWjJV8Tz2nhn-auyX199TR39BHPyJ4OQ1MY';

export const supabase = createClient(supabaseUrl, supabaseKey);

