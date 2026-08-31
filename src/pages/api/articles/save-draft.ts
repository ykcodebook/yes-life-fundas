import type { APIRoute } from 'astro';
import { createServerSupabaseClient, getUserFromCookies } from '../../../lib/supabase/server';
import { slugify } from '../../../lib/utils/slugify';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const user = await getUserFromCookies(cookies, request);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized. Please sign in.' }), { status: 401 });
    }

    if (user.profile?.role === 'reader') {
      return new Response(
        JSON.stringify({ message: 'Forbidden: You must be an approved Editor or Admin to draft articles.' }),
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      title,
      subtitle,
      slug,
      excerpt,
      category_id,
      tag_ids,
      cover_image,
      cover_image_alt,
      cover_image_caption,
      seo_title,
      seo_description,
      canonical_url,
      draft_content,
      reading_time_minutes,
    } = body;

    const client = createServerSupabaseClient(cookies, request);
    const generatedSlug = slug ? slugify(slug) : slugify(title || `draft-${Date.now()}`);

    const basePayload: any = {
      title: title || 'Untitled Draft',
      subtitle: subtitle || '',
      slug: generatedSlug,
      excerpt: excerpt || '',
      category_id: category_id || null,
      cover_image: cover_image || '',
      cover_image_alt: cover_image_alt || '',
      cover_image_caption: cover_image_caption || '',
      seo_title: seo_title || '',
      seo_description: seo_description || '',
      canonical_url: canonical_url || '',
      draft_content: draft_content || { type: 'doc', content: [{ type: 'paragraph' }] },
      reading_time_minutes: reading_time_minutes || 1,
      updated_at: new Date().toISOString(),
    };

    let resultArticle: any;

    if (id) {
      // Update existing article without forcing author_id change
      const { data, error } = await client
        .from('articles')
        .update(basePayload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Fetch article if update succeeded without returning row
        const { data: fetched } = await client.from('articles').select().eq('id', id).maybeSingle();
        resultArticle = fetched || { id, ...basePayload };
      } else {
        resultArticle = data;
      }
    } else {
      // Insert new draft article with user.id as author_id
      const { data, error } = await client
        .from('articles')
        .insert({
          ...basePayload,
          author_id: user.id,
          status: 'draft',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      resultArticle = data || { ...basePayload, author_id: user.id, status: 'draft' };
    }

    // Update tags
    if (tag_ids && Array.isArray(tag_ids) && resultArticle?.id) {
      await client.from('article_tags').delete().eq('article_id', resultArticle.id);
      if (tag_ids.length > 0) {
        const tagRows = tag_ids.map((tId: string) => ({
          article_id: resultArticle.id,
          tag_id: tId,
        }));
        await client.from('article_tags').insert(tagRows);
      }
    }

    return new Response(JSON.stringify({ success: true, article: resultArticle }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('API save-draft error:', err);
    return new Response(JSON.stringify({ message: err.message || 'Error saving draft' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
