/**
 * Extracts plain text from Tiptap ProseMirror JSON and computes reading time in minutes.
 * Average reading speed: 200 words per minute.
 */
export function extractTextFromTiptapJson(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;

  let text = '';
  if (node.text) {
    text += node.text + ' ';
  }
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromTiptapJson(child) + ' ';
    }
  }
  return text.trim();
}

export function calculateReadingTime(content: any): number {
  if (!content) return 1;
  const fullText = typeof content === 'string' ? content : extractTextFromTiptapJson(content);
  const words = fullText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}
