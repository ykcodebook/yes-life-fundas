import React, { useState } from 'react';
import type { Comment, CommentReport } from '../../lib/supabase/types';
import { formatShortDate } from '../../lib/utils/format-date';
import {
  MessageSquare,
  CheckCircle,
  EyeOff,
  Trash2,
  AlertOctagon,
  ShieldCheck,
  Flag,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface CommentModerationProps {
  initialComments: Comment[];
  initialReports: CommentReport[];
}

export const CommentModeration: React.FC<CommentModerationProps> = ({
  initialComments,
  initialReports,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [reports, setReports] = useState<CommentReport[]>(initialReports);
  const [activeTab, setActiveTab] = useState<'comments' | 'reports'>('comments');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleUpdateStatus = async (commentId: string, status: 'visible' | 'hidden' | 'spam' | 'deleted') => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.map((c) => (c.id === commentId ? { ...c, status } : c)));
    } catch (e: any) {
      alert(`Moderation action failed: ${e.message}`);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('comment_reports')
        .update({ status: 'dismissed' })
        .eq('id', reportId);

      if (error) throw error;
      setReports(reports.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r)));
    } catch (e: any) {
      alert(`Dismiss failed: ${e.message}`);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-sans text-zinc-950 dark:text-zinc-50">Comment Moderation</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Maintain healthy discussion quality and review flagged comments.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'comments'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            All Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'reports'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Flagged Reports ({reports.filter((r) => r.status === 'pending').length})
          </button>
        </div>

        {activeTab === 'comments' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">All Statuses</option>
            <option value="visible">Visible</option>
            <option value="pending">Pending</option>
            <option value="hidden">Hidden</option>
            <option value="spam">Spam</option>
          </select>
        )}
      </div>

      {activeTab === 'comments' ? (
        <div className="space-y-3">
          {filteredComments.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              No comments found in this view.
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {comment.user?.full_name || 'Anonymous User'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        comment.status === 'visible'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : comment.status === 'spam'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {comment.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">{formatShortDate(comment.created_at)}</span>
                </div>

                <p className="text-xs text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed">
                  {comment.content}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  {comment.status !== 'visible' && (
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'visible')}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {comment.status !== 'hidden' && (
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'hidden')}
                      className="flex items-center gap-1 px-3 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200"
                    >
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                    </button>
                  )}
                  {comment.status !== 'spam' && (
                    <button
                      onClick={() => handleUpdateStatus(comment.id, 'spam')}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" /> Mark Spam
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(comment.id, 'deleted')}
                    className="flex items-center gap-1 px-3 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              All clear! No pending comment reports.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                      {report.reason}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Reported by {report.reporter?.full_name || 'User'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">{formatShortDate(report.created_at)}</span>
                </div>

                {report.comment && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 italic border-l-2 border-rose-500">
                    "{report.comment.content}"
                  </div>
                )}

                {report.details && (
                  <div className="text-xs text-zinc-500">
                    <strong>Report notes:</strong> {report.details}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleDismissReport(report.id)}
                    className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Dismiss Report
                  </button>
                  {report.comment && (
                    <button
                      onClick={() => handleUpdateStatus(report.comment!.id, 'spam')}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                    >
                      Hide & Mark Spam
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentModeration;
