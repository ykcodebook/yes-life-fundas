import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Sparkles,
  Settings,
  Search,
  History,
  UploadCloud,
  Check,
  RefreshCw,
} from 'lucide-react';
import type { Category, Tag, ArticleVersion } from '../../lib/supabase/types';
import { slugify } from '../../lib/utils/slugify';
import { supabase } from '../../lib/supabase/client';
import { SeoPreview } from './SeoPreview';
import { RevisionHistory } from './RevisionHistory';

interface MetadataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  onSlugChange: (slug: string) => void;
  subtitle: string;
  onSubtitleChange: (subtitle: string) => void;
  excerpt: string;
  onExcerptChange: (excerpt: string) => void;
  categoryId: string | null;
  onCategoryChange: (catId: string | null) => void;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  coverImage: string;
  onCoverImageChange: (url: string) => void;
  coverImageAlt: string;
  onCoverImageAltChange: (alt: string) => void;
  coverImageCaption: string;
  onCoverImageCaptionChange: (caption: string) => void;
  seoTitle: string;
  onSeoTitleChange: (seoTitle: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (seoDesc: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (url: string) => void;
  categories: Category[];
  availableTags: Tag[];
  versions: ArticleVersion[];
  currentVersion: number;
  onRestoreVersion: (version: ArticleVersion) => void;
  wordCount: number;
}

export const MetadataDrawer: React.FC<MetadataDrawerProps> = ({
  isOpen,
  onClose,
  title,
  slug,
  onSlugChange,
  subtitle,
  onSubtitleChange,
  excerpt,
  onExcerptChange,
  categoryId,
  onCategoryChange,
  selectedTagIds,
  onTagsChange,
  coverImage,
  onCoverImageChange,
  coverImageAlt,
  onCoverImageAltChange,
  coverImageCaption,
  onCoverImageCaptionChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  canonicalUrl,
  onCanonicalUrlChange,
  categories,
  availableTags,
  versions,
  currentVersion,
  onRestoreVersion,
  wordCount,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'revisions'>('general');
  const [isUploading, setIsUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `covers/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { error } = await supabase.storage
        .from('article-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('article-media')
        .getPublicUrl(fileName);

      onCoverImageChange(publicUrl);
      if (!coverImageAlt) onCoverImageAltChange(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Article Settings & SEO</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-5 pt-2 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'general'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'seo'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          SEO Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('revisions')}
          className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'revisions'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Revisions ({versions.length})
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'general' && (
          <>
            {/* Slug & URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => onSlugChange(slugify(title))}
                  className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-generate
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                <span className="text-zinc-400 select-none">/articles/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  placeholder="my-article-slug"
                  className="flex-1 bg-transparent border-none outline-none p-0 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <p className="text-[11px] text-zinc-400">Stable, lowercase, hyphen-separated for high SEO indexing value.</p>
            </div>

            {/* Subtitle / Deck */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Subtitle / Deck (Optional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                placeholder="A compelling one-sentence hook..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Excerpt / Summary
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => onExcerptChange(e.target.value)}
                placeholder="Brief summary used in cards, previews, and RSS feeds..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 resize-none"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Cover Image
              </label>

              <input
                type="file"
                ref={coverInputRef}
                onChange={handleUploadCover}
                accept="image/*"
                className="hidden"
              />

              {coverImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-zinc-900 text-xs font-semibold shadow-xs"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => onCoverImageChange('')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-xl flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-brand-600 transition-colors"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-xs font-semibold">
                    {isUploading ? 'Uploading cover...' : 'Upload Cover Image'}
                  </span>
                  <span className="text-[10px] text-zinc-400">PNG, JPG, WEBP up to 10MB</span>
                </button>
              )}

              {coverImage && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={coverImageAlt}
                    onChange={(e) => onCoverImageAltChange(e.target.value)}
                    placeholder="Cover alt text (accessibility / SEO)"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="text"
                    value={coverImageCaption}
                    onChange={(e) => onCoverImageCaptionChange(e.target.value)}
                    placeholder="Cover photo caption / credit (optional)"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => onCategoryChange(e.target.value || null)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-5">
            {/* Custom SEO Fields */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom SEO Title (Optional)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                placeholder={title || 'Defaults to article title'}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Meta Description
              </label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                placeholder={excerpt || 'Defaults to excerpt'}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Canonical URL (Optional)
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => onCanonicalUrlChange(e.target.value)}
                placeholder="https://original-domain.com/post-name"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Live Google SERP and Health Inspector */}
            <SeoPreview
              title={title}
              seoTitle={seoTitle}
              excerpt={excerpt}
              seoDescription={seoDescription}
              slug={slug}
              coverImage={coverImage}
              contentLength={wordCount}
            />
          </div>
        )}

        {activeTab === 'revisions' && (
          <RevisionHistory
            versions={versions}
            currentVersion={currentVersion}
            onRestore={onRestoreVersion}
          />
        )}
      </div>
    </aside>
  );
};

export default MetadataDrawer;
