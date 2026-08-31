import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

  const robotsTxt = `# Robots.txt for Yes Life Fundas
User-agent: *
Allow: /
Allow: /articles/
Allow: /category/
Allow: /tag/
Allow: /author/

# Disallow private and administrative areas
Disallow: /admin/
Disallow: /preview/
Disallow: /search
Disallow: /auth/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
