import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from 'lucide-react';

interface LoginFormProps {
  redirectUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ redirectUrl = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
          },
        });
        if (error) throw error;
        setSuccessMsg('Check your email inbox for the secure login magic link!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Set auth cookie for Astro SSR
        if (data.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
        }

        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">Welcome Back</h1>
        <p className="text-xs text-zinc-500 mt-1">Sign in to publish, discuss, and engage with the community.</p>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {!isMagicLink && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsMagicLink(true)}
                className="text-[11px] text-brand-600 hover:underline"
              >
                Use Magic Link instead
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
        )}

        {isMagicLink && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setIsMagicLink(false)}
              className="text-[11px] text-brand-600 hover:underline"
            >
              Sign in with password
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {isMagicLink ? 'Send Magic Link' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500">
        Don't have an account?{' '}
        <a href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`} className="text-brand-600 font-bold hover:underline">
          Create one for free
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
