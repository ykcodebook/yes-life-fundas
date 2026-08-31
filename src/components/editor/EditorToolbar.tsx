import React, { useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  AlertCircle,
  Table as TableIcon,
  Minus,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  UploadCloud,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface EditorToolbarProps {
  editor: Editor | null;
  onOpenMediaLibrary?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onOpenMediaLibrary }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('article-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('article-media')
        .getPublicUrl(filePath);

      const alt = window.prompt('Enter image description (alt text for accessibility/SEO):', file.name) || '';
      const caption = window.prompt('Enter image caption (optional):') || '';

      editor.chain().focus().setImage({ src: publicUrl, alt, caption } as any).run();
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addCallout = (type: 'info' | 'tip' | 'warning' | 'danger') => {
    editor.chain().focus().insertContent({
      type: 'callout',
      attrs: { type },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: `This is a ${type} callout box. Edit this text.` }],
        },
      ],
    }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 rounded-t-xl">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* History */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Marks */}
      <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded ${editor.isActive('strike') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          className={`p-1.5 rounded ${editor.isActive('highlight') ? 'bg-yellow-200 text-yellow-900 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded ${editor.isActive('code') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded ${editor.isActive('link') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 px-1 border-r border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded ${editor.isActive('taskList') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Task List"
        >
          <ListTodo className="w-4 h-4" />
        </button>
      </div>

      {/* Blocks & Media */}
      <div className="flex items-center gap-0.5 px-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded ${editor.isActive('blockquote') ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Callout dropdown */}
        <div className="relative group">
          <button
            type="button"
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-0.5"
            title="Insert Callout Box"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
          <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 z-30 min-w-[130px]">
            <button
              type="button"
              onClick={() => addCallout('info')}
              className="px-3 py-1.5 text-left text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              💡 Info Note
            </button>
            <button
              type="button"
              onClick={() => addCallout('tip')}
              className="px-3 py-1.5 text-left text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              ✨ Pro Tip
            </button>
            <button
              type="button"
              onClick={() => addCallout('warning')}
              className="px-3 py-1.5 text-left text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              ⚠️ Warning
            </button>
            <button
              type="button"
              onClick={() => addCallout('danger')}
              className="px-3 py-1.5 text-left text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              🛑 Danger
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={addTable}
          className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Insert Table (3x3)"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Upload & Insert Image"
        >
          <UploadCloud className="w-4 h-4 text-brand-600" />
        </button>

        {onOpenMediaLibrary && (
          <button
            type="button"
            onClick={onOpenMediaLibrary}
            className="p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Media Library"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;
