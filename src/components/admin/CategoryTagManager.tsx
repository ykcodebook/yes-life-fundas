import React, { useState } from 'react';
import type { Category, Tag } from '../../lib/supabase/types';
import { slugify } from '../../lib/utils/slugify';
import { Folder, Tag as TagIcon, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface CategoryTagManagerProps {
  initialCategories: Category[];
  initialTags: Tag[];
}

export const CategoryTagManager: React.FC<CategoryTagManagerProps> = ({
  initialCategories,
  initialTags,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  // Tag form state
  const [newTagName, setNewTagName] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const slug = slugify(newCatName);
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCatName.trim(),
          slug,
          description: newCatDesc.trim(),
          color: newCatColor,
        })
        .select()
        .single();

      if (error) throw error;
      setCategories([...categories, data]);
      setNewCatName('');
      setNewCatDesc('');
    } catch (e: any) {
      alert(`Error creating category: ${e.message}`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const slug = slugify(newTagName);
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: newTagName.trim(), slug })
        .select()
        .single();

      if (error) throw error;
      setTags([...tags, data]);
      setNewTagName('');
    } catch (e: any) {
      alert(`Error creating tag: ${e.message}`);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!window.confirm(`Delete tag "${name}"?`)) return;

    try {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
      setTags(tags.filter((t) => t.id !== id));
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
      {/* Categories Management */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Categories ({categories.length})</h2>
        </div>

        {/* Add Category Card */}
        <form
          onSubmit={handleAddCategory}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Create New Category</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category Name (e.g. Life & Wisdom)"
              className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 outline-none focus:border-brand-500"
              required
            />
            <textarea
              rows={2}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Brief description for SEO and archive pages..."
              className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 outline-none focus:border-brand-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500">Accent Color:</span>
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-7 h-7 rounded-md cursor-pointer border-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>
          </div>
        </form>

        {/* Categories List */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">/category/{cat.slug}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags Management */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Tags ({tags.length})</h2>
        </div>

        {/* Add Tag Card */}
        <form
          onSubmit={handleAddTag}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Create New Tag</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag Name (e.g. Architecture)"
              className="flex-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2.5 outline-none focus:border-brand-500"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </form>

        {/* Tags Pills Cloud */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium group"
            >
              <span>#{tag.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteTag(tag.id, tag.name)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTagManager;
