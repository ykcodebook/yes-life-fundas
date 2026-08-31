import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Send, X } from 'lucide-react';

interface PublishChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: () => void;
  isPublishing: boolean;
  data: {
    title: string;
    slug: string;
    category_id?: string | null;
    excerpt?: string;
    cover_image?: string;
    seo_title?: string;
    seo_description?: string;
    wordCount: number;
  };
}

export const PublishChecklist: React.FC<PublishChecklistProps> = ({
  isOpen,
  onClose,
  onConfirmPublish,
  isPublishing,
  data,
}) => {
  if (!isOpen) return null;

  const criticalChecks = [
    {
      label: 'Article Title',
      valid: Boolean(data.title && data.title.trim().length > 3),
      detail: data.title ? `"${data.title}"` : 'Missing article title',
    },
    {
      label: 'URL Slug',
      valid: Boolean(data.slug && /^[a-z0-9-]+$/.test(data.slug)),
      detail: data.slug ? `/articles/${data.slug}` : 'Missing valid URL slug',
    },
    {
      label: 'Content Body',
      valid: data.wordCount >= 10,
      detail: `${data.wordCount} words written`,
    },
  ];

  const recommendations = [
    {
      label: 'Category Assigned',
      valid: Boolean(data.category_id),
      detail: data.category_id ? 'Selected' : 'Categorizing articles improves navigation & SEO',
    },
    {
      label: 'Cover Image',
      valid: Boolean(data.cover_image),
      detail: data.cover_image ? 'Cover image attached' : 'Adds visual engagement to cards & social shares',
    },
    {
      label: 'Excerpt / Summary',
      valid: Boolean(data.excerpt && data.excerpt.length > 20),
      detail: data.excerpt ? `${data.excerpt.length} chars` : 'Used for article cards and RSS feeds',
    },
    {
      label: 'Custom SEO Meta Description',
      valid: Boolean(data.seo_description && data.seo_description.length >= 80),
      detail: data.seo_description ? `${data.seo_description.length} chars` : 'Helps Google display accurate rich snippet',
    },
  ];

  const hasBlockers = criticalChecks.some((c) => !c.valid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Publishing Pre-flight Checklist</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Review validation items before pushing live to readers.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Critical checks */}
        <div className="my-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mandatory Requirements</h4>
            <div className="space-y-2">
              {criticalChecks.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    {item.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate max-w-[200px]">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">SEO & Readability Suggestions</h4>
            <div className="space-y-2">
              {recommendations.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    {item.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate max-w-[180px]">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {hasBlockers && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            Please resolve the mandatory requirements above before publishing.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={hasBlockers || isPublishing}
            onClick={onConfirmPublish}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {isPublishing ? 'Publishing Live...' : 'Publish Article Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishChecklist;
