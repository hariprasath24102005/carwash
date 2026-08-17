import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  defaultMode?: 'signin' | 'signup';
  actionPrompt?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'signin',
  actionPrompt,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { user, error } = await signInWithEmail(email.trim(), password);
        if (error) {
          setErrorMsg(error);
          setIsLoading(false);
          return;
        }
        if (user) {
          onSuccess(user);
          onClose();
        }
      } else {
        const { user, session, error } = await signUpWithEmail(
          email.trim(),
          password,
          fullName.trim() || undefined
        );
        if (error) {
          setErrorMsg(error);
          setIsLoading(false);
          return;
        }

        if (session || user) {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            onSuccess(user);
            onClose();
          }, 800);
        } else {
          setSuccessMsg('Registration successful! Please check your email to confirm your account, then sign in.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Apex Motors Identity
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">
              {mode === 'signin' ? 'Sign In to Your Account' : 'Create Free Apex Account'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {actionPrompt || (mode === 'signin'
                ? 'Access your saved luxury vehicles, valuations, and custom listings.'
                : 'Save dream cars, list your private vehicles, and manage appointments.')}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="mt-4 flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Minimum 6 characters with secure Supabase Auth encryption.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by Supabase Auth with Row Level Security (RLS)</span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
