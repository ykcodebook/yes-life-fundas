import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Edit3,
} from 'lucide-react';

interface ImageBubbleMenuProps {
  editor: Editor | null;
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  if (!editor) return null;

  const shouldShow = () => {
    return editor.isActive('image');
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    editor.chain().focus().updateAttributes('image', { alignment }).run();
  };

  const setWidth = (width: string) => {
    editor.chain().focus().updateAttributes('image', { width }).run();
  };

  const currentAttrs = editor.getAttributes('image');
  const currentAlign = currentAttrs.alignment || 'center';
  const currentWidth = currentAttrs.width || '100%';

  const handleEditAltCaption = () => {
    const newAlt = window.prompt('Image Alt Text (for SEO & Accessibility):', currentAttrs.alt || '');
    if (newAlt !== null) {
      const newCaption = window.prompt('Image Caption (optional):', currentAttrs.caption || '');
      editor.chain().focus().updateAttributes('image', {
        alt: newAlt,
        caption: newCaption !== null ? newCaption : currentAttrs.caption,
      }).run();
    }
  };

  const handleDeleteImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        offset: [0, 8],
      }}
    >
      <div className="flex items-center gap-1 p-1 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 text-xs font-sans animate-in fade-in zoom-in">
        {/* Size Presets */}
        <div className="flex items-center gap-0.5 px-1 border-r border-zinc-700">
          {[
            { label: '25%', val: '25%' },
            { label: '50%', val: '50%' },
            { label: '75%', val: '75%' },
            { label: '100%', val: '100%' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setWidth(item.val)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                currentWidth === item.val
                  ? 'bg-brand-500 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 px-1 border-r border-zinc-700">
          <button
            type="button"
            onClick={() => setAlignment('left')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentAlign === 'left'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Float Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAlignment('center')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentAlign === 'center'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAlignment('right')}
            className={`p-1.5 rounded-lg transition-colors ${
              currentAlign === 'right'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Float Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Edit Alt / Caption */}
        <button
          type="button"
          onClick={handleEditAltCaption}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Edit Alt Text & Caption"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDeleteImage}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950 transition-colors"
          title="Delete Image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </BubbleMenu>
  );
};

export default ImageBubbleMenu;
