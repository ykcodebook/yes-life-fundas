import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../lib/supabase/server';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const client = createServerSupabaseClient();

  const [{ data: articles }, { data: categories }, { data: authors }] = await Promise.all([
    client.from('articles').select('slug, updated_at, published_at').eq('status', 'published'),
    client.from('categories').select('slug, created_at'),
    client.from('profiles').select('username, updated_at').neq('username', ''),
  ]);

  const staticPages = [
    { url: `${siteUrl}`, priority: '1.0', changefreq: 'daily' },
  ];

  const articlePages = (articles || []).map((art) => ({
    url: `${siteUrl}/articles/${art.slug}`,
    lastmod: art.updated_at || art.published_at,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const categoryPages = (categories || []).map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    priority: '0.6',
    changefreq: 'weekly',
  }));

  const authorPages = (authors || []).map((aut) => ({
    url: `${siteUrl}/author/${aut.username}`,
    lastmod: aut.updated_at,
    priority: '0.5',
    changefreq: 'monthly',
  }));

  const allUrls = [...staticPages, ...articlePages, ...categoryPages, ...authorPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls
    .map(
      (entry) => `
    <url>
      <loc>${entry.url}</loc>
      ${entry.lastmod ? `<lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : ''}
      <changefreq>${entry.changefreq || 'weekly'}</changefreq>
      <priority>${entry.priority || '0.5'}</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
