import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { Node, mergeAttributes } from '@tiptap/core';

// Custom Callout Extension
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        rendered: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const el = node as HTMLElement;
          return {
            type: el.getAttribute('data-callout-type') || 'info',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes.type || 'info';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        'data-callout-type': type,
        class: `callout callout-${type}`,
      }),
      ['div', { class: 'callout-content flex-1' }, 0],
    ];
  },
});

// Custom Enhanced Image Extension with caption, alt, width, and alignment
export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: '',
      },
      title: {
        default: '',
      },
      caption: {
        default: '',
      },
      width: {
        default: '100%',
      },
      alignment: {
        default: 'center',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-image-figure]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const el = node as HTMLElement;
          const img = el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || '',
            title: img?.getAttribute('title') || '',
            caption: figcaption?.textContent || '',
            width: el.getAttribute('data-width') || img?.getAttribute('data-width') || '100%',
            alignment: el.getAttribute('data-alignment') || 'center',
          };
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const el = node as HTMLElement;
          return {
            src: el.getAttribute('src') || '',
            alt: el.getAttribute('alt') || '',
            title: el.getAttribute('title') || '',
            caption: el.getAttribute('data-caption') || '',
            width: el.getAttribute('data-width') || '100%',
            alignment: el.getAttribute('data-alignment') || 'center',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, width, alignment, ...imgAttrs } = HTMLAttributes;
    const align = alignment || 'center';
    const w = width || '100%';

    let alignClass = 'text-center my-8 clear-both';
    let imgClass = 'rounded-xl shadow-md transition-all';

    if (align === 'left') {
      alignClass = 'my-6 text-left sm:float-left sm:mr-8 sm:mb-4 clear-left';
    } else if (align === 'right') {
      alignClass = 'my-6 text-right sm:float-right sm:ml-8 sm:mb-4 clear-right';
    } else {
      alignClass = 'my-8 text-center mx-auto clear-both';
      imgClass += ' mx-auto';
    }

    const style = `width: ${w}; max-width: 100%; display: inline-block;`;

    if (caption) {
      return [
        'figure',
        {
          'data-image-figure': '',
          'data-width': w,
          'data-alignment': align,
          class: `image-figure ${alignClass}`,
          style,
        },
        [
          'img',
          mergeAttributes(this.options.HTMLAttributes, imgAttrs, {
            class: `${imgClass} w-full h-auto object-cover`,
            'data-width': w,
            'data-alignment': align,
          }),
        ],
        ['figcaption', { class: 'text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-sans italic' }, caption],
      ];
    }

    return [
      'div',
      {
        'data-width': w,
        'data-alignment': align,
        class: `image-wrapper ${alignClass}`,
        style,
      },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, imgAttrs, {
          class: `${imgClass} w-full h-auto object-cover`,
          'data-width': w,
          'data-alignment': align,
        }),
      ],
    ];
  },
});

export function getEditorExtensions({ placeholder = 'Write your story with passion...' }: { placeholder?: string } = {}) {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'rounded-lg bg-zinc-900 text-zinc-100 p-4 font-mono text-sm overflow-x-auto',
        },
      },
    }),
    Underline,
    Highlight.configure({ multicolor: true }),
    CustomImage.configure({
      allowBase64: true,
      inline: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-brand-600 underline font-medium hover:text-brand-700',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Typography,
    CharacterCount,
    Callout,
    Placeholder.configure({
      placeholder,
    }),
  ];
}
