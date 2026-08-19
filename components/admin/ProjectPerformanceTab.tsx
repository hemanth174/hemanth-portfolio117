'use client';
import React, { useState } from 'react';
import { Trophy, ExternalLink, Code2, Play, Search, Eye, Filter, Sparkles } from 'lucide-react';
import { ProjectPerformance } from './AdminTypes';

interface ProjectPerformanceTabProps {
  projects: ProjectPerformance[];
  loading: boolean;
}

export const ProjectPerformanceTab: React.FC<ProjectPerformanceTabProps> = ({
  projects,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scaleFilter, setScaleFilter] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Filter projects based on search & category
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesScale = scaleFilter === 'all' || p.projectType === scaleFilter;
    return matchesSearch && matchesCat && matchesScale;
  });

  const categories = Array.from(new Set(projects.map((p) => p.category)));
  const totalProjectImpressions = projects.reduce((acc, p) => acc + p.views, 0);
  const totalProjectClicks = projects.reduce((acc, p) => acc + p.totalClicks, 0);
  const avgCtr = totalProjectImpressions > 0 ? Math.round((totalProjectClicks / totalProjectImpressions) * 100) : 0;
  const maxClicks = Math.max(...projects.map((p) => p.totalClicks), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
              Project Performance & Engagement
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Deep dive into project views, demo activations, repository clicks, and click-through rates.
          </p>
        </div>

        {/* Global Project Stats Badge */}
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <div>
            <span className="text-zinc-400 text-[10px] block">Global CTR</span>
            <span className="font-black text-amber-600 dark:text-yellow-400 text-sm">{avgCtr}%</span>
          </div>
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />
          <div>
            <span className="text-zinc-400 text-[10px] block">Total Clicks</span>
            <span className="font-black text-zinc-900 dark:text-white text-sm">{totalProjectClicks}</span>
          </div>
        </div>
      </div>

      {/* Top 3 Leaderboard Cards */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            Top Performing Projects (Leaderboard)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((item, idx) => {
              const medals = ['🥇 #1 Top Performer', '🥈 #2 Runner Up', '🥉 #3 High Interest'];
              const borders = [
                'border-amber-400/80 dark:border-yellow-400/60 bg-gradient-to-b from-amber-500/5 to-transparent',
                'border-zinc-300 dark:border-zinc-700 bg-gradient-to-b from-zinc-500/5 to-transparent',
                'border-amber-700/60 dark:border-amber-600/40 bg-gradient-to-b from-amber-700/5 to-transparent',
              ];

              const cardBg = [
                'bg-amber-50/60 dark:bg-zinc-950/50',
                'bg-white dark:bg-zinc-950/50',
                'bg-white dark:bg-zinc-950/50',
              ];

              return (
                <div
                  key={item.id || idx}
                  className={`p-5 rounded-2xl border ${borders[idx]} ${cardBg[idx]} shadow-sm relative overflow-hidden transition-all hover:scale-[1.01]`}
                >
                  <span
                    className="text-[10px] font-black tracking-wider uppercase font-mono px-2 py-0.5 rounded-full inline-block mb-3"
                    style={{ backgroundColor: '#18181b', color: '#ffffff' }}
                  >
                    {medals[idx]}
                  </span>

                  <h4 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-1 mb-1" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mb-4">
                    {item.category} • {item.projectType === 'small' ? 'Mini / Notebook' : 'Major Project'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center font-mono">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">Demo Clicks</span>
                      <span className="text-sm font-black text-amber-600 dark:text-yellow-400">{item.liveClicks}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">Code Clicks</span>
                      <span className="text-sm font-black text-blue-500">{item.codeClicks}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase">CTR %</span>
                      <span className="text-sm font-black text-emerald-500">{item.ctr}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title or category..."
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-yellow-400 transition-all font-sans"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={scaleFilter}
            onChange={(e) => setScaleFilter(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none cursor-pointer"
          >
            <option value="all">All Scales</option>
            <option value="big">Major Projects</option>
            <option value="small">Small / Notebooks</option>
          </select>
        </div>
      </div>

      {/* Detailed Project Performance Table */}
      <div className="bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Rank & Project</th>
                <th className="py-3.5 px-4">Scale</th>
                <th className="py-3.5 px-4 text-center">Live Demo Clicks</th>
                <th className="py-3.5 px-4 text-center">Code Clicks</th>
                <th className="py-3.5 px-4 text-center">Total Engagement</th>
                <th className="py-3.5 px-4">Popularity Index</th>
                <th className="py-3.5 px-4 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-mono">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const popularityPercent = Math.round((item.totalClicks / maxClicks) * 100);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      {/* Rank & Project Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-mono font-bold text-zinc-600 dark:text-zinc-400 text-[10px]">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white text-xs block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">{item.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Scale */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full font-mono ${
                            item.projectType === 'small'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.projectType === 'small' ? 'Small' : 'Big'}
                        </span>
                      </td>

                      {/* Live Demo Clicks */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-amber-600 dark:text-yellow-400">
                        <div className="inline-flex items-center gap-1">
                          <Play size={10} />
                          {item.liveClicks}
                        </div>
                      </td>

                      {/* Code Clicks */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-blue-500">
                        <div className="inline-flex items-center gap-1">
                          <Code2 size={11} />
                          {item.codeClicks}
                        </div>
                      </td>

                      {/* Total Interactions */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-zinc-900 dark:text-white">
                        {item.totalClicks}
                      </td>

                      {/* Popularity Visual Bar */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(popularityPercent, 4)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-zinc-500 w-8 text-right">
                            {popularityPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Links */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.codeUrl && item.codeUrl !== '#' && (
                            <a
                              href={item.codeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors text-zinc-500"
                              title="View Code Repository"
                            >
                              <Code2 size={13} />
                            </a>
                          )}
                          {item.liveUrl && item.liveUrl !== '#' && (
                            <a
                              href={`/preview?url=${encodeURIComponent(item.liveUrl)}&title=${encodeURIComponent(item.title)}`}
                              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:text-white hover:bg-zinc-800 transition-colors text-zinc-500"
                              title="Preview Live Demo (Iframe)"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
