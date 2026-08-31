import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { Profile, EditorRequest, UserRole } from '../../lib/supabase/types';
import {
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Loader2,
  Sparkles,
  UserCheck,
  Filter,
} from 'lucide-react';
import { formatShortDate } from '../../lib/utils/format-date';

interface UserManagerProps {
  initialProfiles: Profile[];
  initialRequests: EditorRequest[];
}

export const UserManager: React.FC<UserManagerProps> = ({
  initialProfiles,
  initialRequests,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [requests, setRequests] = useState<EditorRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const showNotification = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Refresh data from Supabase
  const refreshData = async () => {
    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profs) setProfiles(profs);

    const { data: reqs } = await supabase
      .from('editor_requests')
      .select('*, user:profiles!user_id(*)')
      .order('created_at', { ascending: false });
    if (reqs) setRequests(reqs);
  };

  // Handle Approve/Reject Editor Request
  const handleApproveReject = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const { data, error } = await supabase.rpc('approve_editor_request', {
        request_id: requestId,
        new_status: status,
      });

      if (error) throw error;

      showNotification(
        status === 'approved'
          ? '🎉 User approved and promoted to Editor!'
          : 'Application marked as rejected.',
        'success'
      );

      await refreshData();
    } catch (err: any) {
      showNotification(err.message || 'Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle direct role change by Master Admin
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setProcessingId(userId);
    try {
      const { data, error } = await supabase.rpc('set_user_role', {
        target_user_id: userId,
        target_role: newRole,
      });

      if (error) throw error;

      showNotification(`Role updated to ${newRole} successfully.`, 'success');
      await refreshData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update role', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Metric Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-xs text-zinc-500 font-semibold">Total Users</div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{profiles.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-xs text-zinc-500 font-semibold">Pending Editor Requests</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {pendingRequests.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-xs text-zinc-500 font-semibold">Editors</div>
          <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
            {profiles.filter((p) => p.role === 'editor').length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="text-xs text-zinc-500 font-semibold">Master Admins</div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {profiles.filter((p) => p.role === 'admin').length}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Editor Applications</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All User Roles ({profiles.length})</span>
        </button>
      </div>

      {/* Tab 1: Editor Applications */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
              No editor applications submitted yet.
            </div>
          ) : (
            requests.map((req) => {
              const applicant = req.user || profiles.find((p) => p.id === req.user_id);
              const isPending = req.status === 'pending';
              const isProcessing = processingId === req.id;

              return (
                <div
                  key={req.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                    isPending
                      ? 'bg-white dark:bg-zinc-900 border-amber-300/80 dark:border-amber-700/60 shadow-md'
                      : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Applicant Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center shrink-0">
                        {applicant?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                            {applicant?.full_name || 'Anonymous User'}
                          </h3>
                          <span className="text-xs text-zinc-400">(@{applicant?.username || 'user'})</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{applicant?.email}</div>
                      </div>
                    </div>

                    {/* Action Buttons for Pending */}
                    {isPending ? (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApproveReject(req.id, 'rejected')}
                          className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApproveReject(req.id, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve as Editor
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-400">
                        Reviewed on {req.reviewed_at ? formatShortDate(req.reviewed_at) : 'recently'}
                      </div>
                    )}
                  </div>

                  {/* Reason & Proposal */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">Pitch / Proposed Topics: </span>
                      <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{req.reason}</span>
                    </div>

                    {req.sample_link && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Writing Sample:</span>
                        <a
                          href={req.sample_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          {req.sample_link} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: User Role Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or username..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-zinc-400 font-semibold shrink-0">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="reader">Readers</option>
                <option value="editor">Editors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Joined</th>
                    <th className="px-6 py-3.5">Assigned Role</th>
                    <th className="px-6 py-3.5 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredProfiles.map((p) => {
                    const isProcessing = processingId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center shrink-0">
                              {p.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.full_name || 'User'}</div>
                              <div className="text-[11px] text-zinc-400">@{p.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{p.email}</td>
                        <td className="px-6 py-4 text-zinc-400">{formatShortDate(p.created_at)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                              p.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                : p.role === 'editor'
                                ? 'bg-brand-100 text-brand-800 dark:bg-brand-950/80 dark:text-brand-300'
                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            disabled={isProcessing}
                            value={p.role}
                            onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer hover:border-brand-500"
                          >
                            <option value="reader">Reader</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin (Master)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
