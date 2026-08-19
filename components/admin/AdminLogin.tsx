'use client';
import React from 'react';
import { Sun, Moon, ShieldAlert, Lock } from 'lucide-react';

interface AdminLoginProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  errorMessage?: string | null;
  attemptedEmail?: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  isDarkTheme,
  onToggleTheme,
  errorMessage,
  attemptedEmail,
}) => {
  const handleGoogleLogin = () => {
    // Direct full-page OAuth redirect (No popup)
    window.location.href = '/api/auth/google';
  };

  return (
    <div className={`admin-shell ${isDarkTheme ? 'admin-dark' : 'admin-light'} min-h-screen flex items-center justify-center px-4 py-12 transition-colors`}>
      <div className="w-full max-w-md">
        {/* Top Header / Theme toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-yellow-400 shadow-sm"
          >
            {isDarkTheme ? <Sun size={13} className="text-yellow-400" /> : <Moon size={13} className="text-amber-600" />}
            <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all">
          {/* Logo & Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 mb-5 shadow-inner">
              <Lock className="w-7 h-7 text-amber-600 dark:text-yellow-400" />
            </div>
            <p className="text-[11px] font-bold tracking-widest uppercase font-mono text-amber-600 dark:text-yellow-400 mb-1">
              Protected Access
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight font-roboto">
              Admin Portal
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-xs font-sans">
              Sign in with your authorized Google account to view analytics and manage portfolio content.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wide font-mono">
                  Access Restricted
                </p>
                <p className="text-red-600 dark:text-red-300 mt-1 leading-relaxed">
                  {errorMessage === 'unauthorized'
                    ? `Account ${attemptedEmail ? `"${attemptedEmail}"` : ''} is not authorized. Only ramasaiahemanth@gmail.com has admin privileges.`
                    : errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Continue with Google Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3.5 py-4 px-5 rounded-2xl font-bold text-sm tracking-wider uppercase font-roboto transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer"
              style={{ backgroundColor: '#18181b', color: '#ffffff' }}
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span style={{ color: '#ffffff' }}>Continue with Google</span>
            </button>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 text-center">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-mono">
                Authorized Admin: <span className="font-bold text-zinc-700 dark:text-zinc-400">ramasaiahemanth@gmail.com</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs mt-8 font-mono">
          Hemanth&apos;s Portfolio • Secure Production Control Room
        </p>
      </div>
    </div>
  );
};
