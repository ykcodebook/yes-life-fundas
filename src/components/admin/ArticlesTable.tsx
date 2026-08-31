import React, { useState } from 'react';
import type { Article, Category } from '../../lib/supabase/types';
import { formatShortDate } from '../../lib/utils/format-date';
import {
  Edit3,
  ExternalLink,
  Eye,
  Trash2,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Clock,
  Layers,
} from 'lucide-react';

interface ArticlesTableProps {
  articles: Article[];
  categories: Category[];
}

export const ArticlesTable: React.FC<ArticlesTableProps> = ({ articles: initialArticles, categories }) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = articles.filter((art) => {
    if (statusFilter !== 'all' && art.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && art.category_id !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q) ||
        art.excerpt?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setArticles(articles.filter((a) => a.id !== id));
    } catch (e: any) {
      alert(`Error deleting article: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-zinc-950 dark:text-zinc-50">Articles</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage, compose, edit, and publish your content.</p>
        </div>
        <a
          href="/admin/editor/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Write New Article
        </a>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Title & Slug */}
                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-bold text-sm text-zinc-950 dark:text-zinc-50 truncate">
                        {art.title || 'Untitled Draft'}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                        /articles/{art.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      {art.category ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${art.category.color}18`,
                            color: art.category.color,
                          }}
                        >
                          {art.category.name}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          art.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : art.status === 'archived'
                            ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        v{art.current_version}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-zinc-500 text-[11px]">
                      {art.status === 'published' && art.published_at
                        ? `Published ${formatShortDate(art.published_at)}`
                        : `Updated ${formatShortDate(art.updated_at)}`}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/admin/editor/${art.id}`}
                          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-brand-600"
                          title="Edit in Visual Editor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </a>

                        {art.status === 'published' && (
                          <a
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-emerald-600"
                            title="View Live Article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(art.id, art.title)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArticlesTable;
