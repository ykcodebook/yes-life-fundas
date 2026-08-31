import type { Article } from '../supabase/types';

export interface SeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  noindex?: boolean;
}

export function generateArticleJsonLd(article: Article, siteUrl: string) {
  const url = `${siteUrl}/articles/${article.slug}`;
  const authorUrl = article.author?.username ? `${siteUrl}/author/${article.author.username}` : siteUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    image: article.cover_image ? [article.cover_image] : [],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: {
      '@type': 'Person',
      name: article.author?.full_name || 'Author',
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Yes Life Fundas',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.svg`,
      },
    },
    articleSection: article.category?.name || 'General',
    keywords: article.tags?.map((t) => t.name).join(', ') || '',
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
