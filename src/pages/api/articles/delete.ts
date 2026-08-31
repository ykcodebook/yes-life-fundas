import type { APIRoute } from 'astro';
import { createServerSupabaseClient, getUserFromCookies } from '../../../lib/supabase/server';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getUserFromCookies(cookies, request);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized. Please sign in.' }), { status: 401 });
    }

    if (user.profile?.role === 'reader') {
      return new Response(
        JSON.stringify({ message: 'Forbidden: You must be an approved Editor or Admin to delete articles.' }),
        { status: 403 }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing article ID' }), { status: 400 });
    }

    const client = createServerSupabaseClient(cookies, request);

    const { error } = await client.from('articles').delete().eq('id', id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err.message || 'Error deleting article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
