import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { Profile, EditorRequest } from '../../lib/supabase/types';
import {
  PenLine,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface RequestEditorCardProps {
  currentUser: Profile | null;
}

export const RequestEditorCard: React.FC<RequestEditorCardProps> = ({ currentUser }) => {
  const [existingRequest, setExistingRequest] = useState<EditorRequest | null>(null);
  const [reason, setReason] = useState('');
  const [sampleLink, setSampleLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchExistingRequest();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchExistingRequest = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('editor_requests')
        .select('*')
        .eq('user_id', currentUser?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setExistingRequest(data);
      }
    } catch (err: any) {
      console.warn('Error fetching editor request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = '/auth/login?redirect=/apply-editor';
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please provide a brief introduction or topics you want to write about.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase
        .from('editor_requests')
        .insert({
          user_id: currentUser.id,
          reason: reason.trim(),
          sample_link: sampleLink.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setExistingRequest(data);
      setSuccessMsg('Your application has been submitted to the editorial board! We will review it shortly.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 mx-auto flex items-center justify-center">
          <PenLine className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Write on Yes Life Fundas</h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Create an account or sign in to submit an application to join our editorial team as a writer.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href="/auth/login?redirect=/apply-editor"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
          >
            Sign In to Apply
          </a>
          <a
            href="/auth/register"
            className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 transition-all"
          >
            Create Reader Account
          </a>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'admin' || currentUser.role === 'editor') {
    return (
      <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          You have {currentUser.role === 'admin' ? 'Master Admin' : 'Editor'} Access
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Your account has full authoring privileges to write essays, save drafts, and publish stories.
        </p>
        <div className="pt-2">
          <a
            href="/admin/editor/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <PenLine className="w-4 h-4" /> Open Author Studio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-md p-6 sm:p-10 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            Apply to Become an Editor
          </h2>
          <p className="text-xs text-zinc-500">
            Share your expertise in life principles, engineering, focus, and mindset.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : existingRequest ? (
        /* Status Card for Existing Application */
        <div className="space-y-6">
          <div
            className={`p-5 rounded-2xl border ${
              existingRequest.status === 'approved'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : existingRequest.status === 'rejected'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {existingRequest.status === 'approved' && <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />}
              {existingRequest.status === 'rejected' && <XCircle className="w-5 h-5 text-rose-600 mt-0.5" />}
              {existingRequest.status === 'pending' && <Clock className="w-5 h-5 text-amber-600 mt-0.5 animate-pulse" />}

              <div>
                <h3 className="text-sm font-bold capitalize">
                  Application Status: {existingRequest.status}
                </h3>
                <p className="text-xs mt-1 opacity-90">
                  {existingRequest.status === 'pending' &&
                    'Your application is currently being reviewed by the Master Admin. You will receive access once approved.'}
                  {existingRequest.status === 'approved' &&
                    'Congratulations! Your application has been approved. You are now an Editor.'}
                  {existingRequest.status === 'rejected' &&
                    'Your application was not approved at this time. You may submit an updated pitch below.'}
                </p>
                <div className="text-[11px] opacity-70 mt-2">
                  Submitted on {new Date(existingRequest.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {existingRequest.status === 'approved' ? (
            <div className="text-center pt-2">
              <a
                href="/admin/editor/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <PenLine className="w-4 h-4" /> Start Writing Now
              </a>
            </div>
          ) : existingRequest.status === 'rejected' ? (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold mb-3 text-zinc-900 dark:text-zinc-100">Re-submit Application</h3>
              {/* Form to re-apply */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Updated Pitch & Topics
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your writing background and what topics you plan to contribute..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Portfolio / Writing Samples URL
                  </label>
                  <input
                    type="url"
                    value={sampleLink}
                    onChange={(e) => setSampleLink(e.target.value)}
                    placeholder="https://yourblog.com or https://github.com/..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Application
                </button>
              </form>
            </div>
          ) : null}
        </div>
      ) : (
        /* Fresh Application Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Why do you want to write on Yes Life Fundas?
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us about your background, ideas, and what topics you would like to write about (e.g. Life Philosophy, Deep Work, System Architecture)..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Sample Writing Link / Portfolio (Optional)
            </label>
            <input
              type="url"
              value={sampleLink}
              onChange={(e) => setSampleLink(e.target.value)}
              placeholder="https://yourblog.com, Substack, Medium, or GitHub profile"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">
              Applications are reviewed by the Master Admin within 24-48 hours.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Application
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RequestEditorCard;
