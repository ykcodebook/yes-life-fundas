import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { getEditorExtensions } from '../../lib/tiptap/extensions';
import { EditorToolbar } from './EditorToolbar';
import { MetadataDrawer } from './MetadataDrawer';
import { PublishChecklist } from './PublishChecklist';
import { MediaPickerModal } from './MediaPickerModal';
import { ImageBubbleMenu } from './ImageBubbleMenu';
import { ArticleRenderer } from '../article/ArticleRenderer';
import { calculateReadingTime, extractTextFromTiptapJson } from '../../lib/utils/reading-time';
import { slugify } from '../../lib/utils/slugify';
import { supabase } from '../../lib/supabase/client';
import {
  Eye,
  EyeOff,
  Settings,
  Send,
  ArrowLeft,
  Check,
  CloudOff,
  Loader2,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import type { Article, Category, Tag, ArticleVersion } from '../../lib/supabase/types';

interface ArticleEditorProps {
  initialArticle?: Partial<Article>;
  categories: Category[];
  availableTags: Tag[];
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialArticle,
  categories,
  availableTags,
}) => {
  const [articleId, setArticleId] = useState<string>(initialArticle?.id || '');
  const [title, setTitle] = useState<string>(initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState<string>(initialArticle?.subtitle || '');
  const [slug, setSlug] = useState<string>(initialArticle?.slug || '');
  const [excerpt, setExcerpt] = useState<string>(initialArticle?.excerpt || '');
  const [categoryId, setCategoryId] = useState<string | null>(initialArticle?.category_id || null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialArticle?.tags?.map((t) => t.id) || []
  );
  const [coverImage, setCoverImage] = useState<string>(initialArticle?.cover_image || '');
  const [coverImageAlt, setCoverImageAlt] = useState<string>(initialArticle?.cover_image_alt || '');
  const [coverImageCaption, setCoverImageCaption] = useState<string>(initialArticle?.cover_image_caption || '');
  const [seoTitle, setSeoTitle] = useState<string>(initialArticle?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState<string>(initialArticle?.seo_description || '');
  const [canonicalUrl, setCanonicalUrl] = useState<string>(initialArticle?.canonical_url || '');
  const [status, setStatus] = useState<string>(initialArticle?.status || 'draft');
  const [currentVersion, setCurrentVersion] = useState<number>(initialArticle?.current_version || 1);
  const [versions, setVersions] = useState<ArticleVersion[]>([]);

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isMetadataDrawerOpen, setIsMetadataDrawerOpen] = useState<boolean>(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('just now');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const saveTimerRef = useRef<any>(null);

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: getEditorExtensions({ placeholder: 'Start drafting your story with wisdom and depth...' }),
    content: initialArticle?.draft_content || initialArticle?.published_content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] text-lg font-serif text-zinc-900 dark:text-zinc-100 leading-relaxed px-4 sm:px-12 py-8',
      },
    },
    onUpdate: () => {
      setSaveStatus('unsaved');
      triggerDebouncedAutosave();
    },
  });

  // Calculate live word count & reading time
  const currentContent = editor?.getJSON() || null;
  const rawText = extractTextFromTiptapJson(currentContent);
  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = calculateReadingTime(currentContent);

  // Auto-sync slug from title if empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
    setSaveStatus('unsaved');
    triggerDebouncedAutosave();
  };

  // Trigger autosave debounced
  const triggerDebouncedAutosave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraftToServer();
    }, 1500);
  }, [articleId, title, subtitle, slug, excerpt, categoryId, selectedTagIds, coverImage, coverImageAlt, coverImageCaption, seoTitle, seoDescription, canonicalUrl, editor]);

  // Load versions if articleId exists
  const fetchVersions = async (id: string) => {
    if (!id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/articles/versions?id=${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (e) {
      console.warn('Could not fetch versions', e);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchVersions(articleId);
    }
  }, [articleId]);

  // Autosave draft handler
  const saveDraftToServer = async () => {
    if (!editor) return;
    const jsonContent = editor.getJSON();

    // 1. Always backup to local storage in case of offline/network issues
    const localBackupKey = `draft_${articleId || 'new'}`;
    localStorage.setItem(localBackupKey, JSON.stringify({
      title,
      subtitle,
      slug,
      excerpt,
      categoryId,
      selectedTagIds,
      coverImage,
      coverImageAlt,
      coverImageCaption,
      seoTitle,
      seoDescription,
      canonicalUrl,
      draft_content: jsonContent,
      savedAt: new Date().toISOString(),
    }));

    if (!navigator.onLine) {
      setSaveStatus('offline');
      return;
    }

    setSaveStatus('saving');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/articles/save-draft', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: articleId || undefined,
          title: title || 'Untitled Draft',
          subtitle,
          slug: slug || slugify(title || 'draft'),
          excerpt,
          category_id: categoryId,
          tag_ids: selectedTagIds,
          cover_image: coverImage,
          cover_image_alt: coverImageAlt,
          cover_image_caption: coverImageCaption,
          seo_title: seoTitle,
          seo_description: seoDescription,
          canonical_url: canonicalUrl,
          draft_content: jsonContent,
          reading_time_minutes: readingTime,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Save failed' }));
        throw new Error(err.message || 'Failed to save');
      }

      const data = await response.json();
      if (data.article?.id && !articleId) {
        setArticleId(data.article.id);
        window.history.replaceState({}, '', `/admin/editor/${data.article.id}`);
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setErrorMessage('');
    } catch (err: any) {
      console.error('Save error:', err);
      setSaveStatus('offline');
      setErrorMessage(err.message);
    }
  };

  // Publish handler
  const handlePublish = async () => {
    if (!editor) return;
    setIsPublishing(true);
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const jsonContent = editor.getJSON();
      const response = await fetch('/api/articles/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: articleId || undefined,
          title,
          subtitle,
          slug,
          excerpt,
          category_id: categoryId,
          tag_ids: selectedTagIds,
          cover_image: coverImage,
          cover_image_alt: coverImageAlt,
          cover_image_caption: coverImageCaption,
          seo_title: seoTitle,
          seo_description: seoDescription,
          canonical_url: canonicalUrl,
          content: jsonContent,
          reading_time_minutes: readingTime,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Publish failed' }));
        throw new Error(err.message || 'Failed to publish');
      }

      const data = await response.json();
      setStatus('published');
      setCurrentVersion(data.article.current_version || currentVersion + 1);
      setIsPublishModalOpen(false);
      fetchVersions(data.article.id);
      alert('🎉 Article published successfully! It is now live to readers.');
    } catch (err: any) {
      setErrorMessage(err.message);
      alert(`Publish error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Insert image from Media Library modal
  const handleInsertMediaImage = (attrs: {
    src: string;
    alt: string;
    caption: string;
    width: string;
    alignment: 'left' | 'center' | 'right';
  }) => {
    if (!editor) return;
    editor.chain().focus().setImage(attrs as any).run();
    setSaveStatus('unsaved');
    triggerDebouncedAutosave();
  };

  // Restore revision handler
  const handleRestoreVersion = (version: ArticleVersion) => {
    if (!window.confirm(`Are you sure you want to restore Version ${version.version_number}? This will update your current working draft.`)) {
      return;
    }

    if (version.content && editor) {
      editor.commands.setContent(version.content);
      if (version.title) setTitle(version.title);
      if (version.subtitle) setSubtitle(version.subtitle);
      if (version.excerpt) setExcerpt(version.excerpt);
      setSaveStatus('unsaved');
      triggerDebouncedAutosave();
      alert(`Version ${version.version_number} restored to your working draft.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      {/* Top Studio Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <a
            href="/admin/articles"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Articles</span>
          </a>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}
            >
              {status === 'published' ? `Live v${currentVersion}` : 'Draft'}
            </span>

            {/* Autosave Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved ({lastSavedTime})</span>
                </>
              )}
              {saveStatus === 'offline' && (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Offline (Draft saved locally)</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Unsaved changes</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Word Count & Reading Time Stats */}
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <span>{wordCount} words</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {readingTime} min read
            </span>
          </div>

          {/* Media Library Trigger */}
          <button
            type="button"
            onClick={() => setIsMediaPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 shadow-xs transition-colors"
            title="Open Media Library to insert photos"
          >
            <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Media Library</span>
          </button>

          {/* Toggle Live Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPreviewMode
                ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>

          {/* Settings & SEO Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMetadataDrawerOpen(!isMetadataDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Settings & SEO</span>
          </button>

          {/* Publish Trigger */}
          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 flex justify-center py-6 sm:py-10 px-3 sm:px-6">
        <div className="w-full max-w-4xl">
          {isPreviewMode && (
            /* 100% Production Article Preview View */
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-14 shadow-lg animate-in fade-in">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
                {categories.find((c) => c.id === categoryId)?.name || 'Editorial'}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-sans tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight mb-4">
                {title || 'Untitled Article'}
              </h1>
              {subtitle && (
                <p className="text-xl font-serif text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  {subtitle}
                </p>
              )}

              {coverImage && (
                <figure className="my-8">
                  <img
                    src={coverImage}
                    alt={coverImageAlt || title}
                    className="w-full max-h-[480px] object-cover rounded-2xl shadow-md"
                  />
                  {coverImageCaption && (
                    <figcaption className="mt-2 text-center text-xs text-zinc-500 font-sans italic">
                      {coverImageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              <hr className="my-8 border-zinc-200 dark:border-zinc-800" />

              {/* Exact Universal Content Renderer */}
              <ArticleRenderer content={currentContent} />
            </div>
          )}

          {/* Visual Authoring Canvas - preserved in DOM to avoid Tippy/ProseMirror unmount collisions */}
          <div
            className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden relative ${
              isPreviewMode ? 'hidden' : 'block'
            }`}
          >
            {/* Sticky Formatting Toolbar */}
            <EditorToolbar
              editor={editor}
              onOpenMediaLibrary={() => setIsMediaPickerOpen(true)}
            />

            {/* Inline Interactive Image Bubble Toolbar for active image resizing & alignment */}
            <ImageBubbleMenu editor={editor} disabled={isPreviewMode} />

            {/* Article Header Form in Canvas */}
            <div className="px-4 sm:px-12 pt-8 pb-4 space-y-4 border-b border-zinc-100 dark:border-zinc-800/80">
              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Article Title..."
                className="w-full text-3xl sm:text-4xl font-extrabold font-sans tracking-tight text-zinc-950 dark:text-zinc-50 placeholder-zinc-400 border-none outline-none p-0 bg-transparent leading-tight"
              />

              {/* Subtitle Input */}
              <input
                type="text"
                value={subtitle}
                onChange={(e) => {
                  setSubtitle(e.target.value);
                  setSaveStatus('unsaved');
                  triggerDebouncedAutosave();
                }}
                placeholder="Add a captivating subtitle (optional)..."
                className="w-full text-lg sm:text-xl font-serif text-zinc-600 dark:text-zinc-300 placeholder-zinc-400 border-none outline-none p-0 bg-transparent"
              />

              {/* Cover Image Preview in Editor */}
              {coverImage && (
                <div className="relative group rounded-xl overflow-hidden my-4 border border-zinc-200 dark:border-zinc-700">
                  <img src={coverImage} alt="Cover Preview" className="w-full max-h-72 object-cover" />
                  <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setIsMetadataDrawerOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/80 text-white text-xs font-semibold backdrop-blur-xs"
                    >
                      Edit Cover
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tiptap Visual Rich Editor Surface */}
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>

      {/* Media Picker Modal (Dedicated Image Browser, Uploader, Sizer, and Positioner) */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={handleInsertMediaImage}
      />

      {/* Metadata & SEO Side Drawer */}
      <MetadataDrawer
        isOpen={isMetadataDrawerOpen}
        onClose={() => setIsMetadataDrawerOpen(false)}
        title={title}
        slug={slug}
        onSlugChange={(newSlug) => {
          setSlug(newSlug);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        subtitle={subtitle}
        onSubtitleChange={(sub) => {
          setSubtitle(sub);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        excerpt={excerpt}
        onExcerptChange={(exc) => {
          setExcerpt(exc);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        categoryId={categoryId}
        onCategoryChange={(catId) => {
          setCategoryId(catId);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        selectedTagIds={selectedTagIds}
        onTagsChange={(tags) => {
          setSelectedTagIds(tags);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        coverImage={coverImage}
        onCoverImageChange={(img) => {
          setCoverImage(img);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        coverImageAlt={coverImageAlt}
        onCoverImageAltChange={(alt) => {
          setCoverImageAlt(alt);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        coverImageCaption={coverImageCaption}
        onCoverImageCaptionChange={(cap) => {
          setCoverImageCaption(cap);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        seoTitle={seoTitle}
        onSeoTitleChange={(sTitle) => {
          setSeoTitle(sTitle);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        seoDescription={seoDescription}
        onSeoDescriptionChange={(sDesc) => {
          setSeoDescription(sDesc);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        canonicalUrl={canonicalUrl}
        onCanonicalUrlChange={(cUrl) => {
          setCanonicalUrl(cUrl);
          setSaveStatus('unsaved');
          triggerDebouncedAutosave();
        }}
        categories={categories}
        availableTags={availableTags}
        versions={versions}
        currentVersion={currentVersion}
        onRestoreVersion={handleRestoreVersion}
        wordCount={wordCount}
      />

      {/* Publishing Validation Modal */}
      <PublishChecklist
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handlePublish}
        isPublishing={isPublishing}
        data={{
          title,
          slug,
          category_id: categoryId,
          excerpt,
          cover_image: coverImage,
          seo_title: seoTitle,
          seo_description: seoDescription,
          wordCount,
        }}
      />
    </div>
  );
};

export default ArticleEditor;
