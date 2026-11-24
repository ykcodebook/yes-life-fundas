import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Direct match for root index.php and blog aliases
  if (
    pathname === '/index.php' ||
    pathname === '/index.php/' ||
    pathname === '/blog' ||
    pathname === '/blog/' ||
    pathname === '/index.php/blog' ||
    pathname === '/index.php/blog/'
  ) {
    return context.redirect(`/${url.search}`, 301);
  }

  // 2. Specific WordPress / legacy prefix mappings
  if (pathname.startsWith('/index.php/articles/')) {
    const target = pathname.replace(/^\/index\.php/, '');
    return context.redirect(`${target}${url.search}`, 301);
  }

  if (pathname.startsWith('/index.php/category/')) {
    const target = pathname.replace(/^\/index\.php/, '');
    return context.redirect(`${target}${url.search}`, 301);
  }

  if (pathname.startsWith('/index.php/tag/')) {
    const target = pathname.replace(/^\/index\.php/, '');
    return context.redirect(`${target}${url.search}`, 301);
  }

  if (pathname.startsWith('/index.php/author/')) {
    const target = pathname.replace(/^\/index\.php/, '');
    return context.redirect(`${target}${url.search}`, 301);
  }

  // 3. Blog path mapping: /blog/:slug or /index.php/blog/:slug -> /articles/:slug
  const blogArticleMatch = pathname.match(/^(?:\/index\.php)?\/blog\/(.+)$/);
  if (blogArticleMatch && blogArticleMatch[1]) {
    const cleanSlug = blogArticleMatch[1].replace(/\/+$/, '');
    if (cleanSlug) {
      return context.redirect(`/articles/${cleanSlug}${url.search}`, 301);
    }
    return context.redirect(`/${url.search}`, 301);
  }

  // 4. Legacy WordPress date-based post URLs: /YYYY/MM/[DD/]post-slug/
  const datePostMatch = pathname.match(/^(?:\/index\.php)?\/\d{4}\/\d{2}(?:\/\d{2})?\/([^\/]+)\/?$/);
  if (datePostMatch && datePostMatch[1]) {
    return context.redirect(`/articles/${datePostMatch[1]}${url.search}`, 301);
  }

  // 5. Any generic /index.php/:slug
  if (pathname.startsWith('/index.php/')) {
    const remainder = pathname.replace(/^\/index\.php\//, '').replace(/\/+$/, '');
    if (!remainder) {
      return context.redirect(`/${url.search}`, 301);
    }
    // Route known top-level sections
    if (remainder === 'search' || remainder.startsWith('auth') || remainder === 'apply-editor') {
      return context.redirect(`/${remainder}${url.search}`, 301);
    }
    // Otherwise redirect to articles
    return context.redirect(`/articles/${remainder}${url.search}`, 301);
  }

  return next();
});
