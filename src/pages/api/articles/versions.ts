import type { APIRoute } from 'astro';
import { createServerSupabaseClient, getUserFromCookies } from '../../../lib/supabase/server';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getUserFromCookies(cookies);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const url = new URL(request.url);
    const articleId = url.searchParams.get('id');

    if (!articleId) {
      return new Response(JSON.stringify({ message: 'Missing article ID' }), { status: 400 });
    }

    const client = createServerSupabaseClient(cookies);

    const { data: versions, error } = await client
      .from('article_versions')
      .select('*, creator:profiles(*)')
      .eq('article_id', articleId)
      .order('version_number', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ versions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
