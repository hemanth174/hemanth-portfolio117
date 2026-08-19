

'use client';
import React, { useState } from 'react';
import { Activity, Play, Code2, FileDown, MessageSquare, Sun, Moon, ExternalLink, Smartphone, Monitor, Globe, RefreshCw } from 'lucide-react';
import { ActivityEvent } from './AdminTypes';

interface ActivityStreamTabProps {
  events: ActivityEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export const ActivityStreamTab: React.FC<ActivityStreamTabProps> = ({
  events,
  loading,
  onRefresh,
}) => {
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredEvents = events.filter((ev) => {
    if (filterCategory === 'all') return true;
    return ev.category === filterCategory;
  });

  const getEventIcon = (category: string, action: string) => {
    if (category === 'project') {
      if (action === 'live_demo') return <Play size={14} className="text-amber-500" />;
      return <Code2 size={14} className="text-blue-500" />;
    }
    if (category === 'resume') return <FileDown size={14} className="text-rose-500" />;
    if (category === 'contact') return <MessageSquare size={14} className="text-emerald-500" />;
    if (category === 'theme') return <Sun size={14} className="text-yellow-400" />;
    if (category === 'social') return <Globe size={14} className="text-purple-500" />;
    return <Activity size={14} className="text-zinc-400" />;
  };

  const getEventBadge = (category: string) => {
    switch (category) {
      case 'project':
        return 'bg-amber-500/10 text-amber-600 dark:text-yellow-400 border-amber-500/20';
      case 'resume':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'contact':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'theme':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'social':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
              Live Activity Stream
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Real-time feed showing actions, demo launches, resume downloads, and visitor interactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none cursor-pointer"
          >
            <option value="all">All Activities</option>
            <option value="project">Project Actions</option>
            <option value="resume">Resume Downloads</option>
            <option value="contact">Contact Messages</option>
            <option value="social">Social Links</option>
            <option value="theme">Theme Toggles</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:border-yellow-400 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
            title="Refresh Activity Stream"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 dark:text-zinc-600 text-sm font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          No activity recorded under this filter yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              {/* Event Content & Badge */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 mt-0.5">
                  {getEventIcon(event.category, event.action)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-black tracking-wider uppercase font-mono px-2 py-0.5 rounded-md border ${getEventBadge(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {event.action === 'live_demo'
                        ? 'Clicked Live Demo'
                        : event.action === 'code_repo'
                        ? 'Viewed Code Repository'
                        : event.action === 'resume_download'
                        ? 'Downloaded Resume PDF'
                        : event.action === 'resume_view'
                        ? 'Viewed Resume Page'
                        : event.action === 'submitted'
                        ? 'Submitted Contact Form'
                        : event.action === 'switch_theme'
                        ? 'Toggled Theme'
                        : event.action.replace('_', ' ')}
                    </span>
                  </div>

                  {event.label && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                      Target: <span className="font-bold text-amber-600 dark:text-yellow-400">{event.label}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Meta Telemetry (Device / Browser / Time) */}
              <div className="flex items-center gap-3 self-end sm:self-center text-[10px] font-mono text-zinc-500 shrink-0">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {event.device === 'mobile' ? <Smartphone size={11} /> : <Monitor size={11} />}
                  <span>{event.os || 'OS'}</span>
                  <span>•</span>
                  <span>{event.browser || 'Browser'}</span>
                </div>

                <span className="font-semibold text-zinc-400 whitespace-nowrap">
                  {formatRelativeTime(event.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
