"use client";
import React from "react";
import { Smartphone, Monitor, Globe, Compass, Users } from "lucide-react";
import { AnalyticsData } from "./AdminTypes";

interface VisitorAnalyticsTabProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

export const VisitorAnalyticsTab: React.FC<VisitorAnalyticsTabProps> = ({
  analytics,
  loading,
}) => {
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  const deviceStats = analytics?.deviceStats || [];
  const browserStats = analytics?.browserStats || [];
  const referrerStats = analytics?.referrerStats || [];

  const totalDeviceCount =
    deviceStats.reduce((acc, d) => acc + d.count, 0) || 1;
  const totalBrowserCount =
    browserStats.reduce((acc, b) => acc + b.count, 0) || 1;
  const totalReferrerCount =
    referrerStats.reduce((acc, r) => acc + r.count, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
            Audience Demographics & Origins
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
          Breakdown of visitor operating hardware, browser engines, and inbound
          channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-roboto flex items-center gap-2">
              <Monitor size={15} className="text-amber-500" />
              Device Type
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              {totalDeviceCount} Events
            </span>
          </div>

          <div className="space-y-3.5">
            {deviceStats.length === 0 ? (
              <p className="text-xs text-zinc-400 font-mono text-center py-6">
                No device data yet
              </p>
            ) : (
              deviceStats.map((item) => {
                const pct = Math.round((item.count / totalDeviceCount) * 100);
                const isMobile = item.name.toLowerCase() === "mobile";

                return (
                  <div
                    key={item.name}
                    className="space-y-1.5 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold capitalize">
                        {isMobile ? (
                          <Smartphone size={12} />
                        ) : (
                          <Monitor size={12} />
                        )}
                        {item.name}
                      </span>
                      <span className="text-zinc-500 font-bold">
                        {pct}% ({item.count})
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div
                        className={`h-full rounded-full ${
                          isMobile ? "bg-amber-500" : "bg-yellow-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Browser Engine */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-roboto flex items-center gap-2">
              <Compass size={15} className="text-blue-500" />
              Web Browser
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              {totalBrowserCount} Events
            </span>
          </div>

          <div className="space-y-3.5">
            {browserStats.length === 0 ? (
              <p className="text-xs text-zinc-400 font-mono text-center py-6">
                No browser data yet
              </p>
            ) : (
              browserStats.map((item) => {
                const pct = Math.round((item.count / totalBrowserCount) * 100);

                return (
                  <div
                    key={item.name}
                    className="space-y-1.5 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold">
                        {item.name}
                      </span>
                      <span className="text-zinc-500 font-bold">
                        {pct}% ({item.count})
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-roboto flex items-center gap-2">
              <Users size={15} className="text-emerald-500" />
              Inbound Traffic Channel
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              {totalReferrerCount} Visits
            </span>
          </div>

          <div className="space-y-3.5">
            {referrerStats.length === 0 ? (
              <p className="text-xs text-zinc-400 font-mono text-center py-6">
                No referrer data yet
              </p>
            ) : (
              referrerStats.map((item) => {
                const pct = Math.round((item.count / totalReferrerCount) * 100);

                return (
                  <div
                    key={item.name}
                    className="space-y-1.5 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold truncate max-w-[160px]">
                        {item.name}
                      </span>
                      <span className="text-zinc-500 font-bold">
                        {pct}% ({item.count})
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
