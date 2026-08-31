import React from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface SeoPreviewProps {
  title: string;
  seoTitle?: string;
  excerpt?: string;
  seoDescription?: string;
  slug: string;
  coverImage?: string;
  contentLength: number;
}

export const SeoPreview: React.FC<SeoPreviewProps> = ({
  title,
  seoTitle,
  excerpt,
  seoDescription,
  slug,
  coverImage,
  contentLength,
}) => {
  const displayTitle = seoTitle || title || 'Untitled Article';
  const displayDescription = seoDescription || excerpt || 'Add a compelling meta description to improve click-through rates from search engines.';
  const displayUrl = `yeslifefundas.com › articles › ${slug || 'article-slug'}`;

  // SEO Health Checks
  const checks = [
    {
      label: 'Title Length (50-60 characters ideal)',
      status: displayTitle.length >= 40 && displayTitle.length <= 65 ? 'pass' : displayTitle.length > 65 ? 'warning' : 'info',
      message: `${displayTitle.length} chars (Target: 40-60)`,
    },
    {
      label: 'Meta Description (120-160 characters ideal)',
      status: displayDescription.length >= 110 && displayDescription.length <= 165 ? 'pass' : displayDescription.length > 165 ? 'warning' : 'warning',
      message: `${displayDescription.length} chars (Target: 120-160)`,
    },
    {
      label: 'URL Slug formatted cleanly',
      status: slug && /^[a-z0-9-]+$/.test(slug) ? 'pass' : 'fail',
      message: slug ? (slug.length > 50 ? 'Slug is a bit long' : 'Valid hyphen-separated format') : 'Missing slug',
    },
    {
      label: 'Featured Cover Image attached',
      status: coverImage ? 'pass' : 'warning',
      message: coverImage ? 'Image set for rich snippet & social cards' : 'Recommended for social sharing cards',
    },
    {
      label: 'Article Word Count & Depth',
      status: contentLength > 300 ? 'pass' : 'warning',
      message: contentLength > 300 ? `${contentLength} words (Great depth)` : `${contentLength} words (Consider expanding)`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Google Search Snippet Simulation */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Search className="w-3.5 h-3.5 text-brand-600" />
          <span>Google Search Result Preview</span>
        </div>

        <div className="max-w-xl font-sans">
          {/* Breadcrumb URL */}
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5 truncate">
            <span className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center text-[10px] font-bold">Y</span>
            <span>{displayUrl}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium leading-snug truncate">
            {displayTitle} | Yes Life Fundas
          </h3>

          {/* Snippet Description */}
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* SEO Health Audit */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">SEO Health Checklist</h4>
        <div className="space-y-2.5">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2">
                {check.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                {check.status === 'fail' && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                {check.status === 'info' && <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{check.label}</span>
              </div>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px] shrink-0">{check.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeoPreview;
