"use client";
import React from "react";
import { Sun, Moon, LogOut, ShieldCheck } from "lucide-react";
import { AdminUser } from "./AdminTypes";

interface AdminHeaderProps {
  user: AdminUser | null;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  isDarkTheme,
  onToggleTheme,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 admin-header backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3.5">
          <div className="admin-brand-mark w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-sm shadow-md">
            {(
              (user?.name ?? "").split(/[.\s]+/).filter(Boolean)[1]?.[0] ??
              user?.email?.[0] ??
              "A"
            ).toLocaleUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="admin-kicker text-[10px] tracking-widest text-amber-600 dark:text-yellow-400 font-bold uppercase font-mono">
                Control Room
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking
              </span>
            </div>
            <h1 className="text-base font-black tracking-tight text-zinc-900 dark:text-white uppercase font-roboto">
              Portfolio Admin Portal
            </h1>
          </div>
        </div>

        {/* Right: User + Theme + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "Admin"}
                  className="w-6 h-6 rounded-full ring-1 ring-yellow-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-[10px]">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-80 dark:text-zinc-200 text-[11px] leading-tight">
                  {user.name || "Hemanth"}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-mono leading-tight">
                  {user.email}
                </span>
              </div>
              <ShieldCheck size={14} className="text-emerald-500 ml-1" />
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="admin-theme-toggle flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-yellow-400 shadow-sm"
            title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkTheme ? (
              <Sun size={14} className="text-yellow-400" />
            ) : (
              <Moon size={14} className="text-amber-600" />
            )}
            <span className="hidden sm:inline">
              {isDarkTheme ? "Light" : "Dark"}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-red-500 hover:text-white hover:bg-red-600 transition-all border border-red-500/30 hover:border-red-600 shadow-sm"
            title="Logout from Admin"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
