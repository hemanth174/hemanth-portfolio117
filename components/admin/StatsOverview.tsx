"use client";
import React from "react";
import {
  Eye,
  Users,
  Clock,
  MousePointerClick,
  FileDown,
  MessageSquare,
  Sparkles,
  RefreshCcw,
} from "lucide-react";
import { AnalyticsData } from "./AdminTypes";

interface StatsOverviewProps {
  analytics: AnalyticsData | null;
  loading: boolean;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onRefresh: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  analytics,
  loading,
  timeRange,
  onTimeRangeChange,
  onRefresh,
}) => {
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  const overview = analytics?.overview || {
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    totalContacts: 0,
    totalProjectClicks: 0,
    totalResumeDownloads: 0,
  };

  const dailyTrend = analytics?.dailyTrend || [];
  const maxTrendVal = Math.max(
    ...dailyTrend.map((d) => Math.max(d.visits, d.uniques)),
    1,
  );

  return (
    <div className="space-y-8">
      {/* Top Controls: Title + Time Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
            Analytics Overview
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Real-time telemetry of audience reach, project interaction, and user
            behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Pills */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "all", label: "All Time" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTimeRangeChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === tab.id
                    ? "bg-yellow-400 text-black shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:border-yellow-400 text-zinc-700 dark:text-zinc-300 hover:text-yellow-500 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-yellow-400/50">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Total Views
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-yellow-400">
              <Eye size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">
            {overview.totalVisits.toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Lifetime impressions
          </span>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-blue-400/50">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Unique Users
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">
            {overview.uniqueVisitors.toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Distinct IP sessions
          </span>
        </div>

        {/* Today's Visits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-emerald-400/50">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Today&apos;s Traffic
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            +{overview.todayVisits.toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Active past 24h
          </span>
        </div>

        {/* Project Clicks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-purple-400/50">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Project Clicks
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <MousePointerClick size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">
            {overview.totalProjectClicks.toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Live demos & repos
          </span>
        </div>

        {/* Resume Downloads */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-rose-400/50">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Resume Downloads
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <FileDown size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">
            {overview.totalResumeDownloads.toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            PDF captures
          </span>
        </div>

        {/* Messages */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:border-amber-400/50">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Inquiries
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">
            {overview.totalContacts.toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Contact form submissions
          </span>
        </div>
      </div>

      {/* Traffic Trend Visual Chart */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white font-roboto">
                Traffic & Engagement Trend
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
              Daily volume of page visits vs unique individuals.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-yellow-400" />
              <span className="text-zinc-600 dark:text-zinc-300">
                Total Visits
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-zinc-600 dark:text-zinc-300">
                Unique Users
              </span>
            </div>
          </div>
        </div>

        {dailyTrend.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-600 text-sm font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            No visitor data captured in this time window yet.
          </div>
        ) : (
          <div className="flex items-end gap-2 sm:gap-3 h-80 pt-6 overflow-x-auto">
            {dailyTrend.map((item) => {
              const visitHeight = Math.max(
                (item.visits / maxTrendVal) * 100,
                6,
              );
              const uniqueHeight = Math.max(
                (item.uniques / maxTrendVal) * 100,
                4,
              );
              const dateLabel = new Date(item._id).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={item._id}
                  className="flex-1  min-w-[38px] flex flex-col items-center gap-2 group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-90 dark:bg-white text-white dark:text-black text-[10px] font-mono py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl border border-zinc-700">
                    <div>{item._id}</div>
                    <div className="font-bold">
                      Visits: {item.visits} | Uniques: {item.uniques}
                    </div>
                  </div>

                  {/* Bars side by side */}
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      style={{ height: `${visitHeight}%` }}
                      className="w-1/2 bg-yellow-400 hover:bg-yellow-300 rounded-t transition-all duration-300"
                    />
                    <div
                      style={{ height: `${uniqueHeight}%` }}
                      className="w-1/2 bg-blue-500 hover:bg-blue-400 rounded-t transition-all duration-300"
                    />
                  </div>

                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono rotate-[-45deg] sm:rotate-0 origin-top-left sm:origin-center mt-1 truncate">
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
