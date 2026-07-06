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
    const [activeTab, setActiveTab] = useState<'contacts' | 'visitors' | 'projects' | 'certifications'>('contacts');
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Contact state
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactsLoading, setContactsLoading] = useState(false);

    // Visitor state
    const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
    const [visitorsLoading, setVisitorsLoading] = useState(false);

    // Project state
    const [projects, setProjects] = useState<any[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        category: 'Personal Project',
        description: '',
        image: '',
        codeUrl: '',
        liveUrl: ''
    });
    const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Certification state
    const [certifications, setCertifications] = useState<any[]>([]);
    const [certsLoading, setCertsLoading] = useState(false);
    const [newCert, setNewCert] = useState({ title: '', img: '' });
    const [certImageType, setCertImageType] = useState<'upload' | 'url'>('upload');
    const [isSubmittingCert, setIsSubmittingCert] = useState(false);
    const [isDraggingCert, setIsDraggingCert] = useState(false);
    const certFileInputRef = useRef<HTMLInputElement>(null);

    const handleCertFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewCert((prev) => ({ ...prev, img: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewProject((prev) => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

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

    const fetchProjects = useCallback(async () => {
        setProjectsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
            setProjects(data.projects);
            // Sync cache
            try {
                localStorage.setItem('portfolio_projects_cache', JSON.stringify(data.projects));
            } catch (e) {}
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setProjectsLoading(false);
        }
    }, []);

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.title.trim() || !newProject.category.trim() || !newProject.description.trim()) {
            setError('Please fill in all required fields (Title, Category, and Description).');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey,
                },
                body: JSON.stringify(newProject),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add project');
            
            setProjects((prev) => {
                const updated = [data.project, ...prev];
                try {
                    localStorage.setItem('portfolio_projects_cache', JSON.stringify(updated));
                } catch (e) {}
                return updated;
            });

            setNewProject({
                title: '',
                category: 'Personal Project',
                description: '',
                image: '',
                codeUrl: '',
                liveUrl: ''
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        setError('');
        try {
            const res = await fetch(`/api/projects?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-key': adminKey,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete project');

            setProjects((prev) => {
                const updated = prev.filter((p) => p._id !== id);
                try {
                    localStorage.setItem('portfolio_projects_cache', JSON.stringify(updated));
                } catch (e) {}
                return updated;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
        }
    };

    const fetchCertifications = useCallback(async () => {
        setCertsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/certificates');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch certificates');
            setCertifications(data.certificates);
            try {
                localStorage.setItem('portfolio_certificates_cache', JSON.stringify(data.certificates));
            } catch (e) {}
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load certifications');
        } finally {
            setCertsLoading(false);
        }
    }, []);

    const handleAddCertification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCert.title.trim() || !newCert.img.trim()) {
            setError('Please provide a title and image/URL for the certificate.');
            return;
        }

        setIsSubmittingCert(true);
        setError('');
        try {
            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey,
                },
                body: JSON.stringify(newCert),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add certificate');

            setCertifications((prev) => {
                const updated = [...prev, data.certificate];
                try {
                    localStorage.setItem('portfolio_certificates_cache', JSON.stringify(updated));
                } catch (e) {}
                return updated;
            });

            setNewCert({ title: '', img: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add certificate');
        } finally {
            setIsSubmittingCert(false);
        }
    };

    const handleDeleteCertification = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
            return;
        }

        setError('');
        try {
            const res = await fetch(`/api/certificates?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-key': adminKey,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete certificate');

            setCertifications((prev) => {
                const updated = prev.filter((c) => c._id !== id);
                try {
                    localStorage.setItem('portfolio_certificates_cache', JSON.stringify(updated));
                } catch (e) {}
                return updated;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete certificate');
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchContacts();
        fetchVisitors();
        fetchProjects();
        fetchCertifications();
    }, [isAuthenticated, fetchContacts, fetchVisitors, fetchProjects, fetchCertifications]);

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
                                value={adminKey || ''}
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
                <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50 mb-8 w-fit">
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
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'projects'
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Manage Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('certifications')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'certifications'
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Manage Certifications
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

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Projects List (left/wider) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Current Projects</h2>
                                <button
                                    onClick={fetchProjects}
                                    disabled={projectsLoading}
                                    className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors flex items-center gap-2"
                                >
                                    <svg className={`w-4 h-4 ${projectsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>

                            {projectsLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : projects.length === 0 ? (
                                <div className="text-center py-20 text-zinc-600 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-lg font-medium">No projects found</p>
                                    <p className="text-sm mt-1">Add projects using the form on the right.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map((project) => (
                                        <div
                                            key={project._id || project.id}
                                            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col group hover:border-zinc-700/50 transition-all"
                                        >
                                            {/* Image Preview */}
                                            <div className="relative w-full h-32 bg-black/40 flex items-center justify-center overflow-hidden">
                                                {project.image ? (
                                                    <img
                                                        src={project.image}
                                                        alt={project.title}
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                ) : (
                                                    <span className="text-zinc-600 text-xs font-mono">No Image</span>
                                                )}
                                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-black text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                    {project.category}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white text-base group-hover:text-yellow-400 transition-colors line-clamp-1">
                                                        {project.title}
                                                    </h3>
                                                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed">
                                                        {project.description}
                                                    </p>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between gap-3">
                                                    <div className="flex gap-2 text-zinc-500">
                                                        {project.codeUrl && (
                                                            <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Code Repository">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" /><path d="M12 18h-.01" /></svg>
                                                            </a>
                                                        )}
                                                        {project.liveUrl && project.liveUrl !== '#' && (
                                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Live Preview">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        className="px-2.5 py-1 bg-red-950/40 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold rounded transition-all cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Project Form (right/narrower) */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 h-fit space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Add New Project</h2>
                                <p className="text-zinc-500 text-xs mt-1">Publish a new project to your portfolio</p>
                            </div>

                            <form onSubmit={handleAddProject} className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Project Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProject.title || ''}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        placeholder="e.g. Portfolio Website"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Category *</label>
                                    <select
                                        value={newProject.category || 'Personal Project'}
                                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                                    >
                                        <option value="Personal Project">Personal Project</option>
                                        <option value="LLM Notebook">LLM Notebook</option>
                                        <option value="StartUp">StartUp</option>
                                        <option value="Freelance Project">Freelance Project</option>
                                        <option value="Open Source">Open Source</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Description *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newProject.description || ''}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="Briefly describe the technologies used and what the project accomplishes..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors resize-none"
                                    />
                                </div>

                                {/* Image inputs toggles */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Project Image</label>
                                    <div className="flex gap-2 mb-3 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setImageType('upload'); setNewProject({ ...newProject, image: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${imageType === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            File Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setImageType('url'); setNewProject({ ...newProject, image: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${imageType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Image URL
                                        </button>
                                    </div>

                                    {newProject.category === 'LLM Notebook' && (
                                        <p className="text-[11px] leading-relaxed text-yellow-500/90 bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 mb-3">
                                            💡 <strong>Google Colab Theme Enabled</strong>: No image upload is needed! A beautiful Google Colab branded card banner will be generated automatically for this notebook.
                                        </p>
                                    )}

                                    {imageType === 'upload' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFile(file);
                                                }}
                                                className="hidden"
                                            />
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(true);
                                                }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDragging(false);
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleFile(file);
                                                }}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`relative w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 ${
                                                    isDragging
                                                        ? 'border-yellow-400 bg-yellow-400/5'
                                                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                }`}
                                            >
                                                {newProject.image ? (
                                                    <div className="relative w-full h-full flex items-center justify-center group/preview">
                                                        <img
                                                            src={newProject.image}
                                                            alt="Preview"
                                                            className="max-h-full max-w-full object-contain rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                            <span className="text-xs font-semibold text-yellow-400">Click or Drag to Change</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center space-y-2 flex flex-col items-center">
                                                        <svg className={`w-8 h-8 ${isDragging ? 'text-yellow-400' : 'text-zinc-500'} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs font-medium text-white">Drag & drop your image here</p>
                                                            <p className="text-[10px] text-zinc-500 mt-1">or click to browse from files</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {newProject.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => setNewProject({ ...newProject, image: '' })}
                                                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove Image
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={newProject.image || ''}
                                            onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                                            placeholder="https://example.com/image.png"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Code URL (GitHub)</label>
                                    <input
                                        type="url"
                                        value={newProject.codeUrl || ''}
                                        onChange={(e) => setNewProject({ ...newProject, codeUrl: e.target.value })}
                                        placeholder="https://github.com/..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Live Demo URL</label>
                                    <input
                                        type="text"
                                        value={newProject.liveUrl || ''}
                                        onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                                        placeholder="https://... or # if none"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold py-3.5 rounded-lg tracking-wider uppercase hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/5 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            Publishing...
                                        </>
                                    ) : (
                                        'Publish Project'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'certifications' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Certifications List */}
                        <div className="lg:col-span-2 order-2 lg:order-1">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                Current Certifications
                                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-normal">
                                    {certifications.length}
                                </span>
                            </h2>

                            {certsLoading ? (
                                <div className="flex justify-center py-20">
                                    <svg className="w-8 h-8 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 12H18" />
                                    </svg>
                                </div>
                            ) : certifications.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                                    <p className="text-zinc-500">No certifications found. Seed list using refresh.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certifications.map((cert) => (
                                        <div key={cert._id || cert.id} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all">
                                            <div>
                                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black/20 mb-3 border border-zinc-900">
                                                    <img
                                                        src={cert.img}
                                                        alt={cert.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <h3 className="font-bold text-white text-sm line-clamp-2 uppercase tracking-wide leading-relaxed font-roboto">
                                                    {cert.title}
                                                </h3>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center">
                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                    {cert.createdAt ? formatDate(cert.createdAt) : 'Static'}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteCertification(cert._id || cert.id)}
                                                    className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-bold font-mono"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    DELETE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Certification Form */}
                        <div className="order-1 lg:order-2">
                            <h2 className="text-xl font-semibold mb-6">Add New Certificate</h2>
                            <form onSubmit={handleAddCertification} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 md:p-6 space-y-5">
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Certificate Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCert.title || ''}
                                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                                        placeholder="e.g. Neo4j Certified Professional"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Certificate Image</label>
                                    <div className="flex gap-2 mb-3 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setCertImageType('upload'); setNewCert({ ...newCert, img: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${certImageType === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            File Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setCertImageType('url'); setNewCert({ ...newCert, img: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${certImageType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Image URL
                                        </button>
                                    </div>

                                    {certImageType === 'upload' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                ref={certFileInputRef}
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleCertFile(file);
                                                }}
                                                className="hidden"
                                            />
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingCert(true);
                                                }}
                                                onDragLeave={() => setIsDraggingCert(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingCert(false);
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleCertFile(file);
                                                }}
                                                onClick={() => certFileInputRef.current?.click()}
                                                className={`relative w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 ${
                                                    isDraggingCert
                                                        ? 'border-yellow-400 bg-yellow-400/5'
                                                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                }`}
                                            >
                                                {newCert.img ? (
                                                    <div className="relative w-full h-full flex items-center justify-center group/preview">
                                                        <img
                                                            src={newCert.img}
                                                            alt="Preview"
                                                            className="max-h-full max-w-full object-contain rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNewCert((prev) => ({ ...prev, img: '' }));
                                                            }}
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center text-red-500 font-semibold text-xs rounded-lg"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-center space-y-2 text-zinc-500">
                                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs font-medium text-zinc-300">Drag & drop your image here</p>
                                                            <p className="text-[10px] text-zinc-600 mt-0.5">or click to browse from files</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="url"
                                                value={newCert.img || ''}
                                                onChange={(e) => setNewCert({ ...newCert, img: e.target.value })}
                                                placeholder="https://example.com/certificate.png"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingCert}
                                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold rounded-lg shadow-lg hover:shadow-yellow-400/5 transition-all flex items-center justify-center gap-2 cursor-pointer font-roboto uppercase text-sm"
                                >
                                    {isSubmittingCert ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Publishing...
                                        </>
                                    ) : (
                                        'Publish Certificate'
                                    )}
                                </button>
                            </form>
                        </div>
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
