import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
  };

  const shareToLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 font-sans text-xs">
      <span className="text-zinc-400 font-semibold flex items-center gap-1 mr-1">
        <Share2 className="w-3.5 h-3.5" /> Share:
      </span>

      <button
        type="button"
        onClick={shareToTwitter}
        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-sky-500 hover:border-sky-500 transition-colors shadow-2xs"
        title="Share on X / Twitter"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={shareToLinkedin}
        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-2xs"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={copyToClipboard}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-semibold"
        title="Copy article link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
};

export default ShareButtons;
