import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://hgdsrurwlcheulhqnqgf.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHNydXJ3bGNoZXVsaHFucWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODUyMjMsImV4cCI6MjEwMzc2MTIyM30.40eN1OLvVDB8iJ--F4HdBTlxyVUS6MGUinavqPCw61E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
