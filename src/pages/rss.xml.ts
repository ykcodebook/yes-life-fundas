import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../lib/supabase/server';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const client = createServerSupabaseClient();

  const { data: articles } = await client
    .from('articles')
    .select('*, author:profiles(*), category:categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30);

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Yes Life Fundas</title>
    <link>${siteUrl}</link>
    <description>Editorial publishing sanctuary dedicated to holistic healing, nervous system restoration, timeless philosophy, and intentional living.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${(articles || [])
      .map(
        (art) => `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${siteUrl}/articles/${art.slug}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${art.slug}</guid>
      <description><![CDATA[${art.seo_description || art.excerpt || art.title}]]></description>
      <author>${art.author?.email || 'editor@yeslifefundas.com'} (${art.author?.full_name || 'Author'})</author>
      <pubDate>${new Date(art.published_at || art.created_at).toUTCString()}</pubDate>
      ${art.category ? `<category>${art.category.name}</category>` : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
