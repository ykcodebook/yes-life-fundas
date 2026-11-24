import React, { useMemo } from 'react';
import { tiptapJsonToHtml } from '../../lib/tiptap/json-to-html';

interface ArticleRendererProps {
  content: any;
  className?: string;
}

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ content, className = '' }) => {
  const html = useMemo(() => {
    if (!content) return '';
    return tiptapJsonToHtml(content);
  }, [content]);

  return (
    <div
      className={`article-content article-body article-protected select-none prose prose-zinc dark:prose-invert max-w-none font-serif leading-relaxed ${className}`}
      data-protected="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default ArticleRenderer;
