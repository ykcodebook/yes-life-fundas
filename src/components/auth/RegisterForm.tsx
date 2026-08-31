import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react';

interface RegisterFormProps {
  redirectUrl?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ redirectUrl = '/' }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.toLowerCase().trim() || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) throw error;

      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = redirectUrl;
      } else {
        setSuccessMsg('Registration successful! Please check your email to confirm your account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">Create an Account</h1>
        <p className="text-xs text-zinc-500 mt-1">Join readers and authors on Yes Life Fundas.</p>
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

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Vance"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Username
          </label>
          <div className="relative">
            <span className="text-xs font-mono text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 select-none">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alexvance"
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 transition-colors font-mono"
            />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">3-20 letters, numbers, or underscores.</p>
        </div>

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

        <div>
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Register Account
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <a href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-brand-600 font-bold hover:underline">
          Sign In
        </a>
      </div>
    </div>
  );
};

export default RegisterForm;
