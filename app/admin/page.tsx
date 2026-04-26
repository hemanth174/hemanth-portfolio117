'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

type SessionData = {
    key: string;
    expiresAt: number;
};

function saveSession(key: string) {
    const session: SessionData = {
        key,
        expiresAt: Date.now() + SESSION_DURATION,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): string | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session: SessionData = JSON.parse(raw);
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session.key;
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

type Contact = {
    _id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
    read: boolean;
};

type DailyVisit = {
    _id: string;
    count: number;
};

type RecentVisit = {
    _id: string;
    ip: string;
    userAgent: string;
    page: string;
    referrer: string;
    visitedAt: string;
};

type VisitorStats = {
    totalVisits: number;
    uniqueVisitors: number;
    todayVisits: number;
    dailyVisits: DailyVisit[];
    recentVisits: RecentVisit[];
};

export default function AdminDashboard() {
    const [adminKey, setAdminKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [activeTab, setActiveTab] = useState<'contacts' | 'visitors'>('contacts');
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Contact state
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactsLoading, setContactsLoading] = useState(false);

    // Visitor state
    const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
    const [visitorsLoading, setVisitorsLoading] = useState(false);

    const [error, setError] = useState('');

    // Restore session from localStorage on mount
    useEffect(() => {
        const savedKey = loadSession();
        if (savedKey) {
            setAdminKey(savedKey);
            setIsAuthenticated(true);
        }
        setIsCheckingSession(false);
    }, []);

    // Set up auto-logout timer when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        // Clear any previous timer
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);

        // Calculate remaining time from stored session
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (raw) {
                const session: SessionData = JSON.parse(raw);
                const remaining = session.expiresAt - Date.now();
                if (remaining > 0) {
                    expiryTimerRef.current = setTimeout(() => {
                        clearSession();
                        setIsAuthenticated(false);
                        setAdminKey('');
                    }, remaining);
                } else {
                    clearSession();
                    setIsAuthenticated(false);
                    setAdminKey('');
                }
            }
        } catch {
            // ignore
        }

        return () => {
            if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        };
    }, [isAuthenticated]);

    const fetchContacts = useCallback(async () => {
        setContactsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/contact', {
                headers: { 'x-admin-key': adminKey },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch contacts');
            setContacts(data.contacts);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load contacts');
        } finally {
            setContactsLoading(false);
        }
    }, [adminKey]);

    const fetchVisitors = useCallback(async () => {
        setVisitorsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/visitors', {
                headers: { 'x-admin-key': adminKey },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch visitors');
            setVisitorStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load visitor stats');
        } finally {
            setVisitorsLoading(false);
        }
    }, [adminKey]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchContacts();
        fetchVisitors();
    }, [isAuthenticated, fetchContacts, fetchVisitors]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminKey.trim()) return;

        // Test the key by making a request
        try {
            const res = await fetch('/api/contact', {
                headers: { 'x-admin-key': adminKey.trim() },
            });
            if (res.ok) {
                saveSession(adminKey.trim());
                setIsAuthenticated(true);
                setError('');
            } else {
                setError('Invalid admin key. Please try again.');
            }
        } catch {
            setError('Failed to connect. Please check your network.');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMaxBarValue = () => {
        if (!visitorStats?.dailyVisits?.length) return 1;
        return Math.max(...visitorStats.dailyVisits.map((d) => d.count), 1);
    };

    // Show nothing while checking saved session (prevents login flash)
    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    {/* Logo area */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 mb-6">
                            <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-zinc-500 mt-2 text-sm">Enter your admin key to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                            <input
                                type="password"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                placeholder="Admin Secret Key"
                                className="relative w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none focus:border-yellow-400/50 transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-3">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-yellow-400 text-black font-bold py-4 rounded-xl tracking-[0.15em] uppercase hover:bg-yellow-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-yellow-400/10"
                        >
                            Authenticate
                        </button>
                    </form>

                    <p className="text-center text-zinc-700 text-xs mt-8">
                        Protected Admin Panel • Hemanth&apos;s Portfolio
                    </p>
                </div>
            </div>
        );
    }

    // Dashboard
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
                    </div>
                    <button
                        onClick={() => { clearSession(); setIsAuthenticated(false); setAdminKey(''); }}
                        className="text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Visits"
                        value={visitorStats?.totalVisits ?? '—'}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        }
                        color="yellow"
                    />
                    <StatCard
                        label="Unique Visitors"
                        value={visitorStats?.uniqueVisitors ?? '—'}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        color="blue"
                    />
                    <StatCard
                        label="Today&apos;s Visits"
                        value={visitorStats?.todayVisits ?? '—'}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="green"
                    />
                    <StatCard
                        label="Messages"
                        value={contacts.length}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                        color="purple"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'contacts'
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Contact Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('visitors')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'visitors'
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Visitor Analytics
                    </button>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-5 py-4">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Contact Messages</h2>
                            <button
                                onClick={fetchContacts}
                                disabled={contactsLoading}
                                className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors flex items-center gap-2"
                            >
                                <svg className={`w-4 h-4 ${contactsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {contactsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="text-center py-20 text-zinc-600">
                                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm mt-1">Messages from your contact form will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact._id}
                                        className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-zinc-700/50 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-sm">
                                                    {contact.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{contact.name}</h3>
                                                    <a href={`mailto:${contact.email}`} className="text-sm text-zinc-500 hover:text-yellow-400 transition-colors">
                                                        {contact.email}
                                                    </a>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 whitespace-nowrap">
                                                {formatDate(contact.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-zinc-300 text-sm leading-relaxed pl-[52px]">
                                            {contact.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Visitors Tab */}
                {activeTab === 'visitors' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Visitor Analytics</h2>
                            <button
                                onClick={fetchVisitors}
                                disabled={visitorsLoading}
                                className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors flex items-center gap-2"
                            >
                                <svg className={`w-4 h-4 ${visitorsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {visitorsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : visitorStats ? (
                            <div className="space-y-8">
                                {/* Chart: Last 7 Days */}
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
                                    <h3 className="text-sm font-medium text-zinc-400 mb-6 tracking-wide uppercase">Last 7 Days</h3>
                                    {visitorStats.dailyVisits.length === 0 ? (
                                        <p className="text-zinc-600 text-sm text-center py-8">No visit data for the last 7 days</p>
                                    ) : (
                                        <div className="flex items-end gap-3 h-40">
                                            {visitorStats.dailyVisits.map((day) => {
                                                const maxVal = getMaxBarValue();
                                                const height = Math.max((day.count / maxVal) * 100, 5);
                                                const dayLabel = new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' });
                                                return (
                                                    <div key={day._id} className="flex-1 flex flex-col items-center gap-2">
                                                        <span className="text-xs text-zinc-500 font-medium">{day.count}</span>
                                                        <div
                                                            className="w-full bg-gradient-to-t from-yellow-400/80 to-yellow-400 rounded-t-lg transition-all duration-500 hover:from-yellow-300 hover:to-yellow-300"
                                                            style={{ height: `${height}%` }}
                                                        ></div>
                                                        <span className="text-xs text-zinc-600">{dayLabel}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Visits Table */}
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-zinc-800/50">
                                        <h3 className="text-sm font-medium text-zinc-400 tracking-wide uppercase">Recent Visits</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-zinc-800/30">
                                                    <th className="text-left px-6 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Time</th>
                                                    <th className="text-left px-6 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Page</th>
                                                    <th className="text-left px-6 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Referrer</th>
                                                    <th className="text-left px-6 py-3 text-zinc-500 font-medium text-xs uppercase tracking-wider">Device</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visitorStats.recentVisits.map((visit) => (
                                                    <tr key={visit._id} className="border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors">
                                                        <td className="px-6 py-3 text-zinc-400 whitespace-nowrap">
                                                            {formatDate(visit.visitedAt)}
                                                        </td>
                                                        <td className="px-6 py-3 text-white font-mono text-xs">
                                                            {visit.page || '/'}
                                                        </td>
                                                        <td className="px-6 py-3 text-zinc-500 max-w-[200px] truncate">
                                                            {visit.referrer || '—'}
                                                        </td>
                                                        <td className="px-6 py-3 text-zinc-500 max-w-[250px] truncate">
                                                            {parseUserAgent(visit.userAgent)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-zinc-600">
                                <p className="text-lg font-medium">No visitor data</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// Helper Components
function StatCard({ label, value, icon, color }: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'yellow' | 'blue' | 'green' | 'purple';
}) {
    const colorMap = {
        yellow: 'from-yellow-400/10 to-yellow-400/5 border-yellow-400/10 text-yellow-400',
        blue: 'from-blue-400/10 to-blue-400/5 border-blue-400/10 text-blue-400',
        green: 'from-green-400/10 to-green-400/5 border-green-400/10 text-green-400',
        purple: 'from-purple-400/10 to-purple-400/5 border-purple-400/10 text-purple-400',
    };

    const iconColorMap = {
        yellow: 'bg-yellow-400/10 text-yellow-400',
        blue: 'bg-blue-400/10 text-blue-400',
        green: 'bg-green-400/10 text-green-400',
        purple: 'bg-purple-400/10 text-purple-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${iconColorMap[color]} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}

function parseUserAgent(ua: string): string {
    if (!ua || ua === 'unknown') return 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Mobile')) return 'Mobile';
    return 'Other';
}
