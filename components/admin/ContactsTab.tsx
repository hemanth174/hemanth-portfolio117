'use client';
import React, { useState } from 'react';
import { Mail, Trash2, Search, RefreshCw, MessageSquare } from 'lucide-react';
import { Contact } from './AdminTypes';

interface ContactsTabProps {
  contacts: Contact[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
  loading,
  onRefresh,
  onDelete,
}) => {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white font-roboto">
              Inbound Messages & Inquiries
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
            Messages received through your portfolio contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-yellow-400"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:border-yellow-400 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 dark:text-zinc-600 text-sm font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          No contact messages found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((contact) => (
            <div
              key={contact._id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-black text-xs font-mono shadow-sm">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {contact.name}
                    </h3>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-xs text-amber-600 dark:text-yellow-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Mail size={11} />
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {formatDate(contact.createdAt)}
                  </span>
                  <button
                    onClick={() => onDelete(contact._id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
