import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://hgdsrurwlcheulhqnqgf.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHNydXJ3bGNoZXVsaHFucWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODUyMjMsImV4cCI6MjEwMzc2MTIyM30.40eN1OLvVDB8iJ--F4HdBTlxyVUS6MGUinavqPCw61E';

export function extractAuthToken(cookies?: AstroCookies, request?: Request): string | null {
  // 1. Check cookies
  let token = cookies?.get('sb-access-token')?.value;
  if (token) return token;

  // 2. Check Authorization header
  if (request) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
      if (token) return token;
    }
  }

  return null;
}

export function createServerSupabaseClient(cookies?: AstroCookies, request?: Request) {
  const token = extractAuthToken(cookies, request);
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  });

  return client;
}

export async function getUserFromCookies(cookies?: AstroCookies, request?: Request) {
  const token = extractAuthToken(cookies, request);
  if (!token) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;

  // Fetch full profile with role
  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return {
    ...user,
    profile: profile || {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Author',
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'author',
      role: 'author',
    },
  };
}
