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
        JSON.stringify({ message: 'Forbidden: You must be an approved Editor or Admin to publish articles.' }),
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
      content,
      reading_time_minutes,
      change_summary,
    } = body;

    const client = createServerSupabaseClient(cookies, request);
    const cleanSlug = slugify(slug || title);

    let existingArticle: any = null;
    if (id) {
      const { data } = await client.from('articles').select('*').eq('id', id).maybeSingle();
      existingArticle = data;
    }

    // Check if slug changed on a published article to record 301 redirect
    if (existingArticle && existingArticle.status === 'published' && existingArticle.slug !== cleanSlug) {
      await client.from('article_slug_redirects').insert({
        old_slug: existingArticle.slug,
        new_slug: cleanSlug,
        article_id: existingArticle.id,
      });
    }

    const nextVersion = existingArticle ? (existingArticle.current_version || 1) + 1 : 1;
    const nowIso = new Date().toISOString();

    const publishPayload: any = {
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      slug: cleanSlug,
      excerpt: excerpt?.trim() || '',
      category_id: category_id || null,
      cover_image: cover_image || '',
      cover_image_alt: cover_image_alt || '',
      cover_image_caption: cover_image_caption || '',
      seo_title: seo_title || '',
      seo_description: seo_description || '',
      canonical_url: canonical_url || '',
      draft_content: content,
      published_content: content,
      status: 'published',
      published_at: existingArticle?.published_at || nowIso,
      updated_at: nowIso,
      current_version: nextVersion,
      reading_time_minutes: reading_time_minutes || 1,
    };

    let resultArticle: any;

    if (id) {
      const { data, error } = await client
        .from('articles')
        .update(publishPayload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      resultArticle = data || { id, ...publishPayload };
    } else {
      const { data, error } = await client
        .from('articles')
        .insert({
          ...publishPayload,
          author_id: user.id,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      resultArticle = data || { ...publishPayload, id: 'new', author_id: user.id };
    }

    // Save immutable snapshot in article_versions
    if (resultArticle?.id) {
      await client.from('article_versions').insert({
        article_id: resultArticle.id,
        version_number: nextVersion,
        title: resultArticle.title,
        subtitle: resultArticle.subtitle,
        excerpt: resultArticle.excerpt,
        content: resultArticle.published_content,
        created_by: user.id,
        change_summary: change_summary || (nextVersion === 1 ? 'Initial publication' : `Published version ${nextVersion}`),
      });
    }

    // Save tags
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
    console.error('API publish error:', err);
    return new Response(JSON.stringify({ message: err.message || 'Error publishing article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
