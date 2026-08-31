import { slugify } from '../utils/slugify';

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarks(text: string, marks?: any[]): string {
  if (!marks || marks.length === 0) return text;

  let result = text;
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`;
        break;
      case 'italic':
        result = `<em>${result}</em>`;
        break;
      case 'underline':
        result = `<u>${result}</u>`;
        break;
      case 'strike':
        result = `<s>${result}</s>`;
        break;
      case 'code':
        result = `<code class="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono">${result}</code>`;
        break;
      case 'highlight':
        const color = mark.attrs?.color || '#fef08a';
        result = `<mark style="background-color: ${color};" class="px-1 rounded">${result}</mark>`;
        break;
      case 'link':
        const href = escapeHtml(mark.attrs?.href || '#');
        const target = mark.attrs?.target || '_blank';
        const rel = target === '_blank' ? ' rel="noopener noreferrer"' : '';
        result = `<a href="${href}" target="${target}"${rel} class="text-brand-600 dark:text-brand-400 underline font-medium hover:underline decoration-brand-400">${result}</a>`;
        break;
    }
  }
  return result;
}

export function tiptapJsonToHtml(node: any, headingsCollector?: HeadingItem[]): string {
  if (!node) return '';

  if (typeof node === 'string') {
    return escapeHtml(node);
  }

  // Handle plain text node
  if (node.type === 'text') {
    const escaped = escapeHtml(node.text || '');
    return renderMarks(escaped, node.marks);
  }

  const childrenHtml = (node.content || [])
    .map((child: any) => tiptapJsonToHtml(child, headingsCollector))
    .join('');

  switch (node.type) {
    case 'doc':
      return childrenHtml;

    case 'paragraph':
      if (!childrenHtml.trim()) return '<p><br /></p>';
      return `<p class="leading-relaxed mb-6 font-serif text-lg text-zinc-800 dark:text-zinc-200">${childrenHtml}</p>`;

    case 'heading': {
      const level = Math.min(Math.max(node.attrs?.level || 2, 1), 6);
      const plainText = (node.content || [])
        .map((c: any) => c.text || '')
        .join('')
        .trim();
      const headingId = slugify(plainText || `heading-${Math.random().toString(36).substring(2, 7)}`);

      if (headingsCollector && level >= 2 && level <= 4 && plainText) {
        headingsCollector.push({
          id: headingId,
          text: plainText,
          level,
        });
      }

      const sizeClasses: Record<number, string> = {
        1: 'text-3xl sm:text-4xl font-extrabold tracking-tight mt-12 mb-6 font-sans text-zinc-950 dark:text-zinc-50',
        2: 'text-2xl sm:text-3xl font-bold tracking-tight mt-10 mb-4 font-sans text-zinc-900 dark:text-zinc-100 border-b border-zinc-200/60 dark:border-zinc-800 pb-2',
        3: 'text-xl sm:text-2xl font-semibold tracking-tight mt-8 mb-3 font-sans text-zinc-900 dark:text-zinc-100',
        4: 'text-lg sm:text-xl font-semibold mt-6 mb-2 font-sans text-zinc-800 dark:text-zinc-200',
        5: 'text-base font-semibold mt-4 mb-2 font-sans text-zinc-800 dark:text-zinc-200',
        6: 'text-sm font-semibold mt-4 mb-2 font-sans text-zinc-800 dark:text-zinc-200 uppercase tracking-wider',
      };

      return `<h${level} id="${headingId}" class="${sizeClasses[level] || ''} scroll-mt-24 group flex items-center">
        <span>${childrenHtml}</span>
        <a href="#${headingId}" class="ml-2 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-sans text-sm" aria-label="Permalink to section">#</a>
      </h${level}>`;
    }

    case 'blockquote':
      return `<blockquote class="border-l-4 border-brand-500 pl-5 py-2 my-6 italic text-zinc-700 dark:text-zinc-300 font-serif text-lg bg-zinc-50/50 dark:bg-zinc-900/30 rounded-r-lg">${childrenHtml}</blockquote>`;

    case 'codeBlock': {
      const language = escapeHtml(node.attrs?.language || '');
      return `<div class="relative my-6 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md">
        ${language ? `<div class="px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between"><span>${language}</span></div>` : ''}
        <pre class="p-4 overflow-x-auto text-sm font-mono text-zinc-100 leading-relaxed"><code>${childrenHtml}</code></pre>
      </div>`;
    }

    case 'bulletList':
      return `<ul class="list-disc pl-6 my-5 space-y-2 font-serif text-lg text-zinc-800 dark:text-zinc-200">${childrenHtml}</ul>`;

    case 'orderedList':
      return `<ol class="list-decimal pl-6 my-5 space-y-2 font-serif text-lg text-zinc-800 dark:text-zinc-200">${childrenHtml}</ol>`;

    case 'listItem':
      return `<li class="pl-1">${childrenHtml}</li>`;

    case 'taskList':
      return `<ul class="space-y-2 my-4 pl-0 list-none">${childrenHtml}</ul>`;

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'checked' : '';
      return `<li class="flex items-start gap-3 text-zinc-800 dark:text-zinc-200 font-serif text-lg">
        <input type="checkbox" ${checked} disabled class="mt-1.5 rounded border-zinc-300 text-brand-600 focus:ring-brand-500 cursor-default" />
        <div class="flex-1">${childrenHtml}</div>
      </li>`;
    }

    case 'horizontalRule':
      return `<hr class="my-10 border-t border-zinc-200 dark:border-zinc-800" />`;

    case 'image': {
      const src = escapeHtml(node.attrs?.src || '');
      const alt = escapeHtml(node.attrs?.alt || '');
      const caption = escapeHtml(node.attrs?.caption || '');
      const width = escapeHtml(node.attrs?.width || '100%');
      const alignment = node.attrs?.alignment || 'center';

      let alignClass = 'my-8 text-center mx-auto clear-both';
      let imgClass = 'rounded-xl shadow-md w-full h-auto object-cover';

      if (alignment === 'left') {
        alignClass = 'my-6 text-left sm:float-left sm:mr-8 sm:mb-4 clear-left';
      } else if (alignment === 'right') {
        alignClass = 'my-6 text-right sm:float-right sm:ml-8 sm:mb-4 clear-right';
      } else {
        alignClass = 'my-8 text-center mx-auto clear-both';
        imgClass += ' mx-auto';
      }

      const style = `style="width: ${width}; max-width: 100%; display: inline-block;"`;

      if (caption) {
        return `<figure class="image-figure ${alignClass}" ${style} data-width="${width}" data-alignment="${alignment}">
          <img src="${src}" alt="${alt}" loading="lazy" class="${imgClass}" />
          <figcaption class="mt-2.5 text-center text-xs font-sans text-zinc-500 dark:text-zinc-400 italic">${caption}</figcaption>
        </figure>`;
      }
      return `<div class="image-wrapper ${alignClass}" ${style} data-width="${width}" data-alignment="${alignment}">
        <img src="${src}" alt="${alt}" loading="lazy" class="${imgClass}" />
      </div>`;
    }

    case 'callout': {
      const type = node.attrs?.type || 'info';
      const icons: Record<string, string> = {
        info: '💡',
        tip: '✨',
        warning: '⚠️',
        danger: '🛑',
      };
      const titles: Record<string, string> = {
        info: 'Note',
        tip: 'Pro Tip',
        warning: 'Important Notice',
        danger: 'Caution',
      };

      return `<div class="callout callout-${type} my-6 p-5 rounded-xl border-l-4 shadow-xs" data-type="callout">
        <span class="text-xl select-none" aria-hidden="true">${icons[type] || '📌'}</span>
        <div class="flex-1 text-base leading-relaxed">
          <div class="font-sans font-bold text-sm uppercase tracking-wide mb-1 opacity-90">${titles[type] || 'Note'}</div>
          <div class="prose-p:mb-2 last:prose-p:mb-0">${childrenHtml}</div>
        </div>
      </div>`;
    }

    case 'table':
      return `<div class="my-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800"><table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left font-sans text-sm">${childrenHtml}</table></div>`;

    case 'tableRow':
      return `<tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">${childrenHtml}</tr>`;

    case 'tableHeader':
      return `<th class="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100">${childrenHtml}</th>`;

    case 'tableCell':
      return `<td class="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">${childrenHtml}</td>`;

    case 'hardBreak':
      return '<br />';

    default:
      return childrenHtml;
  }
}

export function extractHeadingsFromContent(content: any): HeadingItem[] {
  const headings: HeadingItem[] = [];
  tiptapJsonToHtml(content, headings);
  return headings;
}
