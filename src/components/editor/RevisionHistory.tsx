import React from 'react';
import { History, RotateCcw, Clock, User, Check } from 'lucide-react';
import type { ArticleVersion } from '../../lib/supabase/types';
import { formatShortDate } from '../../lib/utils/format-date';

interface RevisionHistoryProps {
  versions: ArticleVersion[];
  currentVersion: number;
  onRestore: (version: ArticleVersion) => void;
  onPreviewVersion?: (version: ArticleVersion) => void;
  isLoading?: boolean;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  versions,
  currentVersion,
  onRestore,
  onPreviewVersion,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-zinc-500 text-sm">
        <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
        Loading revisions...
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 text-sm">
        <History className="w-8 h-8 mx-auto mb-2 text-zinc-400 opacity-60" />
        <p className="font-medium text-zinc-700 dark:text-zinc-300">No revisions yet</p>
        <p className="text-xs text-zinc-500 mt-1">Revisions are created automatically whenever you publish or save major drafts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Version History ({versions.length})</span>
        <span className="text-[11px] text-zinc-400">Current: v{currentVersion}</span>
      </div>

      <div className="space-y-2">
        {versions.map((ver) => {
          const isCurrent = ver.version_number === currentVersion;
          return (
            <div
              key={ver.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-brand-500/50 bg-brand-50/40 dark:bg-brand-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    v{ver.version_number}
                  </span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                      <Check className="w-3 h-3" /> Active Live
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-400">{formatShortDate(ver.created_at)}</span>
              </div>

              <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate mb-2">
                {ver.title || 'Untitled snapshot'}
              </div>

              {ver.change_summary && (
                <div className="text-[11px] text-zinc-500 italic mb-2">
                  "{ver.change_summary}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                  <User className="w-3 h-3" />
                  <span>{ver.creator?.full_name || 'Author'}</span>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => onRestore(ver)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevisionHistory;
