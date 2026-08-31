import React, { useState, useEffect } from 'react';
import type { Comment, Profile } from '../../lib/supabase/types';
import { timeAgo } from '../../lib/utils/format-date';
import {
  MessageSquare,
  Reply,
  Edit2,
  Trash2,
  Flag,
  Send,
  User,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface CommentSectionProps {
  articleId: string;
  initialComments?: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId, initialComments = [] }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('spam');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Check authenticated user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            setCurrentUser({ ...data.user, profile });
          });
      }
    });

    // Fetch comments
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, user:profiles(*)')
      .eq('article_id', articleId)
      .eq('status', 'visible')
      .order('created_at', { ascending: true });

    if (data) {
      // Build nested hierarchy
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      data.forEach((c) => {
        commentMap.set(c.id, { ...c, replies: [] });
      });

      data.forEach((c) => {
        if (c.parent_id && commentMap.has(c.parent_id)) {
          commentMap.get(c.parent_id)!.replies!.push(commentMap.get(c.id)!);
        } else {
          rootComments.push(commentMap.get(c.id)!);
        }
      });

      setComments(rootComments);
    }
  };

  const handleCreateComment = async (parentId: string | null = null, text: string) => {
    if (!text.trim() || !currentUser) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: currentUser.id,
          parent_id: parentId,
          content: text.trim(),
          status: 'visible',
        })
        .select('*, user:profiles(*)')
        .single();

      if (error) throw error;

      if (parentId) {
        setReplyingToId(null);
        setReplyText('');
      } else {
        setNewCommentText('');
      }

      await loadComments();
    } catch (err: any) {
      alert(`Error posting comment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editText.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingCommentId(null);
      setEditText('');
      await loadComments();
    } catch (err: any) {
      alert(`Error updating comment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'deleted', content: '[This comment has been deleted by user]' })
        .eq('id', commentId);

      if (error) throw error;
      await loadComments();
    } catch (err: any) {
      alert(`Error deleting comment: ${err.message}`);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportCommentId || !currentUser) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('comment_reports').insert({
        comment_id: reportCommentId,
        reported_by: currentUser.id,
        reason: reportReason,
        details: reportDetails,
        status: 'pending',
      });

      if (error) throw error;

      setReportCommentId(null);
      setReportDetails('');
      alert('Thank you. This comment has been reported to moderators for review.');
    } catch (err: any) {
      alert(`Error submitting report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentNode = (comment: Comment, depth = 0) => {
    const isOwner = currentUser && currentUser.id === comment.user_id;
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToId === comment.id;

    return (
      <div
        key={comment.id}
        className={`group relative ${depth > 0 ? 'ml-4 sm:ml-8 mt-3 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800' : 'mt-5'}`}
      >
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
          {/* Comment Author Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {comment.user?.avatar_url ? (
                <img
                  src={comment.user.avatar_url}
                  alt={comment.user.full_name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
                  {comment.user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {comment.user?.full_name || 'Reader'}
                </span>
                {comment.user?.role && comment.user.role !== 'reader' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {comment.user.role}
                  </span>
                )}
              </div>
            </div>

            <span className="text-[11px] text-zinc-400">{timeAgo(comment.created_at)}</span>
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isSubmitting}
                  className="px-3 py-1 rounded-md bg-brand-600 text-white text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCommentId(null)}
                  className="px-3 py-1 rounded-md text-zinc-600 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500">
            {currentUser && depth < 3 && (
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(isReplying ? null : comment.id);
                  setReplyText('');
                }}
                className="flex items-center gap-1 hover:text-brand-600 transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply
              </button>
            )}

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditText(comment.content);
                  }}
                  className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="flex items-center gap-1 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            )}

            {currentUser && !isOwner && (
              <button
                type="button"
                onClick={() => setReportCommentId(comment.id)}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                title="Report comment"
              >
                <Flag className="w-3 h-3" />
                Report
              </button>
            )}
          </div>
        </div>

        {/* Reply Input Form */}
        {isReplying && (
          <div className="mt-2 ml-4 pl-3 border-l-2 border-brand-500 animate-in fade-in">
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to ${comment.user?.full_name || 'comment'}...`}
                rows={2}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 resize-none"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !replyText.trim()}
                  onClick={() => handleCreateComment(comment.id, replyText)}
                  className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  <Send className="w-3 h-3" /> Post Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render Nested Replies */}
        {comment.replies && comment.replies.map((reply) => renderCommentNode(reply, depth + 1))}
      </div>
    );
  };

  return (
    <section id="discussion" className="mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
            Discussion ({comments.length})
          </h3>
        </div>
      </div>

      {/* Main Comment Box */}
      {currentUser ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span>Commenting as</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              {currentUser.profile?.full_name || currentUser.email}
            </span>
          </div>
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your perspective, constructive insight, or question..."
            rows={3}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              disabled={isSubmitting || !newCommentText.trim()}
              onClick={() => handleCreateComment(null, newCommentText)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Post Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center mb-8">
          <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Join the Conversation</h4>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Sign in to share your thoughts, ask questions, and reply to authors.
          </p>
          <a
            href={`/auth/login?redirect=/articles/${articleId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-colors"
          >
            Sign In to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => renderCommentNode(comment, 0))
        )}
      </div>

      {/* Report Modal */}
      {reportCommentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Report Comment</h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                >
                  <option value="spam">Spam / Promotional</option>
                  <option value="harassment">Harassment or Hate Speech</option>
                  <option value="abusive">Abusive / Inappropriate</option>
                  <option value="off_topic">Off-topic</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Additional details</label>
                <textarea
                  rows={2}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Optional context for moderators..."
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setReportCommentId(null)}
                className="px-3 py-1.5 text-xs text-zinc-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitReport}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CommentSection;
