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
    const [activeTab, setActiveTab] = useState<'contacts' | 'visitors' | 'projects' | 'certifications' | 'events' | 'workflows' | 'experience'>('contacts');
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
        projectType: 'big' as 'big' | 'small',
        description: '',
        image: '',
        codeUrl: '',
        liveUrl: ''
    });
    const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingProject, setEditingProject] = useState<any>(null);

    // Certification state
    const [certifications, setCertifications] = useState<any[]>([]);
    const [certsLoading, setCertsLoading] = useState(false);
    const [newCert, setNewCert] = useState({ title: '', img: '' });
    const [certImageType, setCertImageType] = useState<'upload' | 'url'>('upload');
    const [isSubmittingCert, setIsSubmittingCert] = useState(false);
    const [isDraggingCert, setIsDraggingCert] = useState(false);
    const certFileInputRef = useRef<HTMLInputElement>(null);
    const [editingCert, setEditingCert] = useState<any>(null);

    // Event state
    const [events, setEvents] = useState<any[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'college' as 'college' | 'off-college',
        date: '',
        description: '',
        location: '',
        image: '',
        link: ''
    });
    const [eventImageType, setEventImageType] = useState<'upload' | 'url'>('upload');
    const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
    const [isDraggingEvent, setIsDraggingEvent] = useState(false);
    const eventFileInputRef = useRef<HTMLInputElement>(null);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    // Workflow state
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(false);
    const [newWorkflow, setNewWorkflow] = useState({
        title: '',
        description: '',
        category: 'Automation',
        tags: '',
        thumbnail: '',
        workflowJson: '',
    });
    const [workflowThumbType, setWorkflowThumbType] = useState<'upload' | 'url'>('upload');
    const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);
    const [isDraggingWorkflow, setIsDraggingWorkflow] = useState(false);
    const workflowJsonRef = useRef<HTMLInputElement>(null);
    const workflowThumbRef = useRef<HTMLInputElement>(null);
    const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

    // Work Experience state
    const [workExperiences, setWorkExperiences] = useState<any[]>([]);
    const [workExperiencesLoading, setWorkExperiencesLoading] = useState(false);
    const [newExperience, setNewExperience] = useState({
        company: '',
        role: '',
        duration: '',
        isCurrent: false,
        location: '',
        description: '',
        skills: '',
        link: '',
        proof: '',
    });
    const [experienceProofType, setExperienceProofType] = useState<'upload' | 'url'>('upload');
    const [isSubmittingExperience, setIsSubmittingExperience] = useState(false);
    const experienceProofRef = useRef<HTMLInputElement>(null);

    const handleEventFile = (file: File) => {
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
            setNewEvent((prev) => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

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

    const handleDeleteContact = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
            return;
        }

        setError('');
        try {
            const res = await fetch(`/api/contact?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-key': adminKey,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete contact message');

            setContacts((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete contact message');
        }
    };

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
            const isEdit = !!editingProject;
            const res = await fetch('/api/projects', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify(isEdit ? { ...newProject, _id: editingProject._id } : newProject),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || (isEdit ? 'Failed to update project' : 'Failed to add project'));
            setProjects((prev) => {
                const updated = isEdit
                    ? prev.map((p) => (p._id === editingProject._id ? { ...p, ...newProject } : p))
                    : [data.project, ...prev];
                try { localStorage.setItem('portfolio_projects_cache', JSON.stringify(updated)); } catch (e) {}
                return updated;
            });
            setNewProject({ title: '', category: 'Personal Project', projectType: 'big', description: '', image: '', codeUrl: '', liveUrl: '' });
            setEditingProject(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save project');
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
            const isEdit = !!editingCert;
            const res = await fetch('/api/certificates', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify(isEdit ? { ...newCert, _id: editingCert._id } : newCert),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save certificate');
            setCertifications((prev) => {
                const updated = isEdit
                    ? prev.map((c) => (c._id === editingCert._id ? { ...c, ...newCert } : c))
                    : [...prev, data.certificate];
                try { localStorage.setItem('portfolio_certificates_cache', JSON.stringify(updated)); } catch (e) {}
                return updated;
            });
            setNewCert({ title: '', img: '' });
            setEditingCert(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save certificate');
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

    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
            setEvents(data.events);
            try {
                localStorage.setItem('portfolio_events_cache', JSON.stringify(data.events));
            } catch (e) {}
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setEventsLoading(false);
        }
    }, []);

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title.trim() || !newEvent.date.trim() || !newEvent.description.trim() || !newEvent.location.trim()) {
            setError('Please provide a title, date, description, and location for the event.');
            return;
        }
        setIsSubmittingEvent(true);
        setError('');
        try {
            const isEdit = !!editingEvent;
            const res = await fetch('/api/events', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify(isEdit ? { ...newEvent, _id: editingEvent._id } : newEvent),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save event');
            setEvents((prev) => {
                const updated = isEdit
                    ? prev.map((ev) => (ev._id === editingEvent._id ? { ...ev, ...newEvent } : ev))
                    : [data.event, ...prev];
                try { localStorage.setItem('portfolio_events_cache', JSON.stringify(updated)); } catch (e) {}
                return updated;
            });
            setNewEvent({ title: '', type: 'college', date: '', description: '', location: '', image: '', link: '' });
            setEditingEvent(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save event');
        } finally {
            setIsSubmittingEvent(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        setError('');
        try {
            const res = await fetch(`/api/events?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-key': adminKey,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete event');

            setEvents((prev) => {
                const updated = prev.filter((ev) => ev._id !== id);
                try {
                    localStorage.setItem('portfolio_events_cache', JSON.stringify(updated));
                } catch (e) {}
                return updated;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete event');
        }
    };

    const fetchWorkflows = useCallback(async () => {
        setWorkflowsLoading(true);
        setError('');
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch workflows');
            setWorkflows(data.workflows || []);
            try { localStorage.setItem('portfolio_workflows_cache', JSON.stringify(data.workflows)); } catch (e) {}
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workflows');
        } finally {
            setWorkflowsLoading(false);
        }
    }, []);

    const handleAddWorkflow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkflow.title.trim() || !newWorkflow.description.trim()) {
            setError('Title and description are required.');
            return;
        }
        if (!editingWorkflow && !newWorkflow.workflowJson.trim()) {
            setError('A valid n8n JSON file is required for new workflows.');
            return;
        }
        setIsSubmittingWorkflow(true);
        setError('');
        try {
            const isEdit = !!editingWorkflow;
            const res = await fetch('/api/workflows', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify(isEdit ? { ...newWorkflow, _id: editingWorkflow._id } : newWorkflow),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save workflow');
            setWorkflows((prev) => isEdit
                ? prev.map((w) => (w._id === editingWorkflow._id ? { ...w, ...newWorkflow } : w))
                : [data.workflow, ...prev]
            );
            setNewWorkflow({ title: '', description: '', category: 'Automation', tags: '', thumbnail: '', workflowJson: '' });
            setEditingWorkflow(null);
            if (workflowJsonRef.current) workflowJsonRef.current.value = '';
            if (workflowThumbRef.current) workflowThumbRef.current.value = '';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save workflow');
        } finally {
            setIsSubmittingWorkflow(false);
        }
    };

    const handleDeleteWorkflow = async (id: string) => {
        if (!window.confirm('Delete this workflow? This cannot be undone.')) return;
        setError('');
        try {
            const res = await fetch(`/api/workflows?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': adminKey },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete workflow');
            setWorkflows((prev) => prev.filter((w) => w._id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete workflow');
        }
    };

    const fetchWorkExperiences = useCallback(async () => {
        setWorkExperiencesLoading(true);
        setError('');
        try {
            const res = await fetch('/api/experience');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch work experiences');
            setWorkExperiences(data.experiences || []);
            try { localStorage.setItem('portfolio_work_experience_cache', JSON.stringify(data.experiences)); } catch (e) {}
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load work experiences');
        } finally {
            setWorkExperiencesLoading(false);
        }
    }, []);

    const [editingExperience, setEditingExperience] = useState<any>(null);

    const handleAddExperience = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExperience.company.trim() || !newExperience.role.trim() || !newExperience.duration.trim() || !newExperience.description.trim()) {
            setError('Company, role, duration, and description are required.');
            return;
        }
        setIsSubmittingExperience(true);
        setError('');
        try {
            const isEdit = !!editingExperience;
            const res = await fetch('/api/experience', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
                body: JSON.stringify(isEdit ? { ...newExperience, _id: editingExperience._id } : newExperience),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save work experience');
            setWorkExperiences((prev) => isEdit
                ? prev.map((exp) => (exp._id === editingExperience._id ? { ...exp, ...newExperience } : exp))
                : [data.experience, ...prev]
            );
            setNewExperience({ company: '', role: '', duration: '', isCurrent: false, location: '', description: '', skills: '', link: '', proof: '' });
            setEditingExperience(null);
            if (experienceProofRef.current) experienceProofRef.current.value = '';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save work experience');
        } finally {
            setIsSubmittingExperience(false);
        }
    };

    const handleDeleteExperience = async (id: string) => {
        if (!window.confirm('Delete this work experience entry? This cannot be undone.')) return;
        setError('');
        try {
            const res = await fetch(`/api/experience?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-key': adminKey },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete work experience');
            setWorkExperiences((prev) => prev.filter((exp) => exp._id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete work experience');
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchContacts();
        fetchVisitors();
        fetchProjects();
        fetchCertifications();
        fetchEvents();
        fetchWorkflows();
        fetchWorkExperiences();
    }, [isAuthenticated, fetchContacts, fetchVisitors, fetchProjects, fetchCertifications, fetchEvents, fetchWorkflows, fetchWorkExperiences]);

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
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'events'
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Manage Events
                    </button>
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === 'workflows'
                                ? 'bg-[#EA4B35] text-white shadow-lg shadow-[#EA4B35]/20'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <svg width="14" height="14" viewBox="0 0 60 60" fill="none"><rect width="60" height="60" rx="10" fill="#EA4B35"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="white">n8n</text></svg>
                        n8n Workflows
                    </button>
                    <button
                        onClick={() => setActiveTab('experience')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'experience'
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Work Experience
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
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-zinc-600 whitespace-nowrap">
                                                    {formatDate(contact.createdAt)}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteContact(contact._id)}
                                                    className="px-2.5 py-1 bg-red-950/40 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold rounded transition-all cursor-pointer"
                                                    title="Delete message"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                                    <span className="px-2 py-0.5 bg-yellow-400 text-black text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                        {project.category}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-full uppercase tracking-wider ${
                                                        (project.projectType === 'small' || project.category === 'LLM Notebook') 
                                                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' 
                                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    }`}>
                                                        {project.projectType === 'small' || project.category === 'LLM Notebook' ? 'Small Project' : 'Big Project'}
                                                    </span>
                                                </div>
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
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { setEditingProject(project); setNewProject({ title: project.title, category: project.category, projectType: project.projectType || 'big', description: project.description, image: project.image || '', codeUrl: project.codeUrl || '', liveUrl: project.liveUrl || '' }); }}
                                                            className="px-2.5 py-1 bg-blue-950/40 hover:bg-blue-600 hover:text-white text-blue-400 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1"
                                                            title="Edit project"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(project._id)}
                                                            className="px-2.5 py-1 bg-red-950/40 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold rounded transition-all cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Project Form (right/narrower) */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 h-fit space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                                {editingProject && <button onClick={() => { setEditingProject(null); setNewProject({ title: '', category: 'Personal Project', projectType: 'big', description: '', image: '', codeUrl: '', liveUrl: '' }); }} className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer">✕ Cancel Edit</button>}
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

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-zinc-400 text-xs font-medium mb-1.5">Category *</label>
                                        <select
                                            value={newProject.category || 'Personal Project'}
                                            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-xs outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                                        >
                                            <option value="Personal Project">Personal Project</option>
                                            <option value="LLM Notebook">LLM Notebook</option>
                                            <option value="StartUp">StartUp</option>
                                            <option value="Freelance Project">Freelance Project</option>
                                            <option value="Open Source">Open Source</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-zinc-400 text-xs font-medium mb-1.5">Project Scale *</label>
                                        <select
                                            value={newProject.projectType || 'big'}
                                            onChange={(e) => setNewProject({ ...newProject, projectType: e.target.value as 'big' | 'small' })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-xs outline-none focus:border-yellow-400 transition-colors cursor-pointer font-medium"
                                        >
                                            <option value="big">Big Project (Major)</option>
                                            <option value="small">Small Project (Mini / Notebook)</option>
                                        </select>
                                    </div>
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
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setEditingCert(cert); setNewCert({ title: cert.title, img: cert.img }); }}
                                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer font-bold font-mono"
                                                        title="Edit certificate"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        EDIT
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCertification(cert._id || cert.id)}
                                                        className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-bold font-mono"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        DELETE
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Certification Form */}
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">{editingCert ? 'Edit Certificate' : 'Add New Certificate'}</h2>
                                {editingCert && <button onClick={() => { setEditingCert(null); setNewCert({ title: '', img: '' }); }} className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer">✕ Cancel</button>}
                            </div>
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

                {activeTab === 'events' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Events List */}
                        <div className="lg:col-span-2 order-2 lg:order-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    Current Events & Activities
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-normal">
                                        {events.length}
                                    </span>
                                </h2>
                                <button
                                    onClick={fetchEvents}
                                    disabled={eventsLoading}
                                    className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors flex items-center gap-2"
                                >
                                    
                                    Refresh
                                </button>
                            </div>

                            {eventsLoading ? (
                                <div className="flex justify-center py-20">
                                    <svg className="w-8 h-8 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 12H18" />
                                    </svg>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                                    <p className="text-zinc-500">No events found. Seed list using refresh.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {events.map((ev) => (
                                        <div key={ev._id || ev.id} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-800 transition-all">
                                            <div>
                                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-black/20 mb-3 border border-zinc-900 flex items-center justify-center">
                                                    {ev.image ? (
                                                        <img
                                                            src={ev.image}
                                                            alt={ev.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-[10px] text-zinc-650 font-mono border border-zinc-900/50 p-2 text-center rounded">
                                                            No Image (Stylized Mock Badge Used)
                                                        </div>
                                                    )}
                                                    <span className={`absolute top-2 right-2 text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                                                        ev.type === 'college' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                                                    }`}>
                                                        {ev.type === 'college' ? 'College' : 'External'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-white text-sm line-clamp-2 uppercase tracking-wide leading-relaxed font-roboto">
                                                    {ev.title}
                                                </h3>
                                                <p className="text-zinc-505 text-xs mt-1.5 line-clamp-2 leading-relaxed">{ev.description}</p>
                                                <div className="mt-3 space-y-1 text-[10px] text-zinc-500 font-mono">
                                                    <div>📍 {ev.location}</div>
                                                    <div>📅 {ev.date}</div>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-zinc-900/50 flex justify-between items-center">
                                                <span className="text-[9px] text-zinc-500 font-mono">
                                                    {ev.createdAt ? formatDate(ev.createdAt) : 'Static'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setEditingEvent(ev); setNewEvent({ title: ev.title, type: ev.type, date: ev.date, description: ev.description, location: ev.location, image: ev.image || '', link: ev.link || '' }); }}
                                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer font-bold font-mono"
                                                        title="Edit event"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        EDIT
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(ev._id || ev.id)}
                                                        className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-bold font-mono"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        DELETE
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Event Form */}
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                                {editingEvent && <button onClick={() => { setEditingEvent(null); setNewEvent({ title: '', type: 'college', date: '', description: '', location: '', image: '', link: '' }); }} className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer">✕ Cancel</button>}
                            </div>
                            <form onSubmit={handleAddEvent} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 md:p-6 space-y-5">
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Event Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.title || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        placeholder="e.g. Breaking into IoT Workshop"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Event Type *</label>
                                    <select
                                        value={newEvent.type}
                                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'college' | 'off-college' })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition-colors cursor-pointer"
                                    >
                                        <option value="college">On-Campus (College)</option>
                                        <option value="off-college">Off-Campus (External)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-400 text-xs font-medium mb-1.5">Date *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newEvent.date || ''}
                                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                            placeholder="e.g. 23 MAR 2025"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-zinc-400 text-xs font-medium mb-1.5">Location *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newEvent.location || ''}
                                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                            placeholder="e.g. NIAT, Hyderabad"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Event Description *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={newEvent.description || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        placeholder="Brief details of what you did/learned at this event..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">How it went — Story (Optional)</label>
                                    <textarea
                                        rows={4}
                                        value={(newEvent as any).story || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, ...(newEvent as any), story: e.target.value } as any)}
                                        placeholder="Write a full story about this event — what happened, what you built, learned, or achieved..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors resize-none text-sm"
                                    />
                                    <p className="text-[10px] text-zinc-600 mt-1">This appears in the event preview drawer as &quot;HOW IT WENT&quot;.</p>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Tags / Topics (Optional)</label>
                                    <input
                                        type="text"
                                        value={Array.isArray((newEvent as any).tags) ? ((newEvent as any).tags as string[]).join(', ') : ((newEvent as any).tags || '')}
                                        onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value } as any)}
                                        placeholder="IoT, Workshop, NIAT, Electronics (comma-separated)"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                    <p className="text-[10px] text-zinc-600 mt-1">Shown as tag pills in the event preview drawer.</p>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Event Image (Optional)</label>
                                    <div className="flex gap-2 mb-3 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setEventImageType('upload'); setNewEvent({ ...newEvent, image: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${eventImageType === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            File Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setEventImageType('url'); setNewEvent({ ...newEvent, image: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${eventImageType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            Image URL
                                        </button>
                                    </div>

                                    {eventImageType === 'upload' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                ref={eventFileInputRef}
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleEventFile(file);
                                                }}
                                                className="hidden"
                                            />
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingEvent(true);
                                                }}
                                                onDragLeave={() => setIsDraggingEvent(false)}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDraggingEvent(false);
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleEventFile(file);
                                                }}
                                                onClick={() => eventFileInputRef.current?.click()}
                                                className={`relative w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 ${
                                                    isDraggingEvent
                                                        ? 'border-yellow-400 bg-yellow-400/5'
                                                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                                }`}
                                            >
                                                {newEvent.image ? (
                                                    <div className="relative w-full h-full flex items-center justify-center group/preview">
                                                        <img
                                                            src={newEvent.image}
                                                            alt="Preview"
                                                            className="max-h-full max-w-full object-contain rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNewEvent((prev) => ({ ...prev, image: '' }));
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
                                                            <p className="text-[10px] text-zinc-650 mt-0.5">or click to browse from files</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="url"
                                                value={newEvent.image || ''}
                                                onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                                                placeholder="https://example.com/event-photo.png"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Event Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={newEvent.link || ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
                                        placeholder="https://example.com/certificate-or-post"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4.5 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingEvent}
                                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold rounded-lg shadow-lg hover:shadow-yellow-400/5 transition-all flex items-center justify-center gap-2 cursor-pointer font-roboto uppercase text-sm"
                                >
                                    {isSubmittingEvent ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Publishing...
                                        </>
                                    ) : (
                                        'Publish Event'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* ─── n8n Workflows Tab ─── */}
                {activeTab === 'workflows' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Add Workflow Form */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-[#EA4B35]/10 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 60 60" fill="none"><rect width="60" height="60" rx="10" fill="#EA4B35"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="white">n8n</text></svg>
                                </div>
                                <h2 className="text-lg font-semibold">Upload n8n Workflow</h2>
                            </div>

                            <form onSubmit={handleAddWorkflow} className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Workflow Title *</label>
                                    <input
                                        required
                                        type="text"
                                        value={newWorkflow.title}
                                        onChange={(e) => setNewWorkflow({ ...newWorkflow, title: e.target.value })}
                                        placeholder="e.g. Auto-reply Gmail with AI"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-[#EA4B35]/60 transition-colors"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Category</label>
                                    <div className="relative">
                                        <select
                                            value={newWorkflow.category}
                                            onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#EA4B35]/60 transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="Automation">Automation</option>
                                            <option value="AI Agent">AI Agent</option>
                                            <option value="Data Pipeline">Data Pipeline</option>
                                            <option value="Webhook">Webhook</option>
                                            <option value="Notification">Notification</option>
                                            <option value="Custom">Custom</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Description *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={newWorkflow.description}
                                        onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                                        placeholder="What does this workflow do? Who is it useful for?"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-[#EA4B35]/60 transition-colors resize-none"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={newWorkflow.tags}
                                        onChange={(e) => setNewWorkflow({ ...newWorkflow, tags: e.target.value })}
                                        placeholder="Gmail, AI, OpenAI, Auto-reply"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-[#EA4B35]/60 transition-colors"
                                    />
                                </div>

                                {/* Thumbnail */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Thumbnail (optional)</label>
                                    <div className="flex gap-2 mb-2 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                                        <button type="button" onClick={() => { setWorkflowThumbType('upload'); setNewWorkflow({ ...newWorkflow, thumbnail: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${workflowThumbType === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                            File Upload
                                        </button>
                                        <button type="button" onClick={() => { setWorkflowThumbType('url'); setNewWorkflow({ ...newWorkflow, thumbnail: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${workflowThumbType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                            Image URL
                                        </button>
                                    </div>
                                    {workflowThumbType === 'upload' ? (
                                        <input
                                            ref={workflowThumbRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 5 * 1024 * 1024) { setError('Image must be < 5 MB.'); return; }
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewWorkflow((p) => ({ ...p, thumbnail: reader.result as string }));
                                                reader.readAsDataURL(file);
                                            }}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-400 text-xs outline-none focus:border-[#EA4B35]/60 transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
                                        />
                                    ) : (
                                        <input
                                            type="url"
                                            value={newWorkflow.thumbnail}
                                            onChange={(e) => setNewWorkflow({ ...newWorkflow, thumbnail: e.target.value })}
                                            placeholder="https://example.com/image.png"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-[#EA4B35]/60 transition-colors"
                                        />
                                    )}
                                </div>

                                {/* n8n JSON File Upload */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                                        n8n Workflow JSON File *
                                        <span className="ml-2 text-[#EA4B35] font-normal">(.json exported from n8n)</span>
                                    </label>
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingWorkflow(true); }}
                                        onDragLeave={() => setIsDraggingWorkflow(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDraggingWorkflow(false);
                                            const file = e.dataTransfer.files[0];
                                            if (!file || !file.name.endsWith('.json')) { setError('Please drop a .json file.'); return; }
                                            const reader = new FileReader();
                                            reader.onloadend = () => setNewWorkflow((p) => ({ ...p, workflowJson: reader.result as string }));
                                            reader.readAsText(file);
                                        }}
                                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDraggingWorkflow ? 'border-[#EA4B35] bg-[#EA4B35]/5' : 'border-zinc-800 hover:border-zinc-600'}`}
                                        onClick={() => workflowJsonRef.current?.click()}
                                    >
                                        <input
                                            ref={workflowJsonRef}
                                            type="file"
                                            accept=".json,application/json"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewWorkflow((p) => ({ ...p, workflowJson: reader.result as string }));
                                                reader.readAsText(file);
                                            }}
                                        />
                                        {newWorkflow.workflowJson ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-[#EA4B35]/10 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-[#EA4B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <p className="text-sm text-[#EA4B35] font-semibold">Workflow JSON loaded!</p>
                                                <p className="text-xs text-zinc-500">{(newWorkflow.workflowJson.length / 1024).toFixed(1)} KB — Click to replace</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                <p className="text-sm text-zinc-500">Drop your n8n <span className="text-white font-semibold">.json</span> here or click to browse</p>
                                                <p className="text-xs text-zinc-700">Export from n8n → Settings → Export Workflow</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-1.5">🔒 Credentials are automatically stripped before visitors can download.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingWorkflow || !newWorkflow.workflowJson}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#EA4B35] hover:bg-[#d63d29] text-white font-bold rounded-xl tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingWorkflow ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Publish Workflow'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Existing Workflows List */}
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold">
                                    Published Workflows
                                    <span className="ml-2 text-sm text-zinc-600 font-normal">({workflows.length})</span>
                                </h2>
                                <button onClick={fetchWorkflows} disabled={workflowsLoading}
                                    className="text-sm text-zinc-400 hover:text-[#EA4B35] transition-colors flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${workflowsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Refresh
                                </button>
                            </div>

                            {workflowsLoading ? (
                                <div className="flex justify-center py-14"><div className="w-8 h-8 border-2 border-[#EA4B35] border-t-transparent rounded-full animate-spin" /></div>
                            ) : workflows.length === 0 ? (
                                <div className="text-center py-14 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                                    <svg width="40" height="40" viewBox="0 0 60 60" fill="none" className="mx-auto mb-3 opacity-30"><rect width="60" height="60" rx="10" fill="#EA4B35"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="white">n8n</text></svg>
                                    <p className="text-sm">No workflows uploaded yet</p>
                                    <p className="text-xs mt-1 text-zinc-700">Use the form to publish your first n8n workflow</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                                    {workflows.map((wf) => (
                                        <div key={wf._id} className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-all group">
                                            <div className="w-9 h-9 rounded-lg bg-[#EA4B35]/10 flex items-center justify-center shrink-0">
                                                <svg width="18" height="18" viewBox="0 0 60 60" fill="none"><rect width="60" height="60" rx="8" fill="#EA4B35"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="bold" fontFamily="monospace" fill="white">n8n</text></svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{wf.title}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5 truncate">{wf.description}</p>
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-[#EA4B35]/10 text-[#EA4B35] border border-[#EA4B35]/20 rounded font-mono uppercase">{wf.category}</span>
                                                    {wf.nodeCount > 0 && <span className="text-[9px] text-zinc-600 font-mono">{wf.nodeCount} nodes</span>}
                                                    {wf.tags?.slice(0,3).map((t: string, i: number) => (
                                                        <span key={i} className="text-[9px] text-zinc-600 font-mono border border-zinc-800 px-1.5 py-0.5 rounded">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setEditingWorkflow(wf); setNewWorkflow({ title: wf.title, description: wf.description, category: wf.category, tags: Array.isArray(wf.tags) ? wf.tags.join(', ') : (wf.tags || ''), thumbnail: wf.thumbnail || '', workflowJson: '' }); }}
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center text-zinc-700 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all cursor-pointer"
                                                    title="Edit workflow"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWorkflow(wf._id)}
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
                                                    title="Delete workflow"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* ─── Work Experience Tab ─── */}
                {activeTab === 'experience' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Add Experience Form */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold">Add Work Experience / Internship</h2>
                            </div>

                            <form onSubmit={handleAddExperience} className="space-y-5">
                                {/* Role / Title */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Role / Job Title *</label>
                                    <input
                                        required
                                        type="text"
                                        value={newExperience.role}
                                        onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                                        placeholder="e.g. Full Stack Developer Intern"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Company Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={newExperience.company}
                                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                        placeholder="e.g. Acme Tech Solutions"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                {/* Duration & Is Current Checkbox */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-400 text-xs font-medium mb-1.5">Duration / Dates *</label>
                                        <input
                                            required
                                            type="text"
                                            value={newExperience.duration}
                                            onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                                            placeholder="e.g. JAN 2025 - PRESENT"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={newExperience.isCurrent}
                                                onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
                                                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-yellow-400 focus:ring-yellow-400 accent-yellow-400 cursor-pointer"
                                            />
                                            Current Active Internship/Role
                                        </label>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        value={newExperience.location}
                                        onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                                        placeholder="e.g. Hyderabad, India (Remote)"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Responsibilities & Key Impact *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={newExperience.description}
                                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                                        placeholder="Describe what you built, learned, or achieved during this role..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors resize-none"
                                    />
                                    <p className="text-[10px] text-zinc-600 mt-1">Tip: Separate points into new lines to render structured bullet points.</p>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Tech Stack / Skills (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={newExperience.skills}
                                        onChange={(e) => setNewExperience({ ...newExperience, skills: e.target.value })}
                                        placeholder="Next.js, Node.js, MongoDB, TypeScript"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                {/* Company Link */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Company Website Link (optional)</label>
                                    <input
                                        type="url"
                                        value={newExperience.link}
                                        onChange={(e) => setNewExperience({ ...newExperience, link: e.target.value })}
                                        placeholder="https://company.com"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                    />
                                </div>

                                {/* Offer Letter / Proof Document */}
                                <div>
                                    <label className="block text-zinc-400 text-xs font-medium mb-1.5">Offer / Experience Letter Proof File (optional)</label>
                                    <div className="flex gap-2 mb-2 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                                        <button type="button" onClick={() => { setExperienceProofType('upload'); setNewExperience({ ...newExperience, proof: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${experienceProofType === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                            File Upload
                                        </button>
                                        <button type="button" onClick={() => { setExperienceProofType('url'); setNewExperience({ ...newExperience, proof: '' }); }}
                                            className={`flex-1 py-1 rounded text-xs font-medium transition-all ${experienceProofType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                            Image URL
                                        </button>
                                    </div>
                                    {experienceProofType === 'upload' ? (
                                        <input
                                            ref={experienceProofRef}
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 10 * 1024 * 1024) { setError('Proof file must be < 10 MB.'); return; }
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewExperience((p) => ({ ...p, proof: reader.result as string }));
                                                reader.readAsDataURL(file);
                                            }}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-400 text-xs outline-none focus:border-yellow-400 transition-colors file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
                                        />
                                    ) : (
                                        <input
                                            type="url"
                                            value={newExperience.proof}
                                            onChange={(e) => setNewExperience({ ...newExperience, proof: e.target.value })}
                                            placeholder="https://example.com/offer_letter.pdf"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-700 outline-none focus:border-yellow-400 transition-colors"
                                        />
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingExperience}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl tracking-wide transition-all disabled:opacity-40"
                                >
                                    {isSubmittingExperience ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            Publishing...
                                        </>
                                    ) : (
                                        'Publish Experience'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Listed Experiences */}
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold">
                                    Published Experiences
                                    <span className="ml-2 text-sm text-zinc-600 font-normal">({workExperiences.length})</span>
                                </h2>
                                <button onClick={fetchWorkExperiences} disabled={workExperiencesLoading}
                                    className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${workExperiencesLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Refresh
                                </button>
                            </div>

                            {workExperiencesLoading ? (
                                <div className="flex justify-center py-14"><div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
                            ) : workExperiences.length === 0 ? (
                                <div className="text-center py-14 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                                    <p className="text-sm">No work experiences added yet</p>
                                    <p className="text-xs mt-1 text-zinc-700">Add your internship or work experience using the form</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                                    {workExperiences.map((exp) => (
                                        <div key={exp._id} className="flex items-start gap-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-all group">
                                            <div className="w-9 h-9 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0 font-bold">
                                                {exp.company ? exp.company.charAt(0).toUpperCase() : 'W'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-white truncate">{exp.role}</p>
                                                    {exp.isCurrent && (
                                                        <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono uppercase">Current</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-yellow-400/90 font-medium mt-0.5">{exp.company} • <span className="text-zinc-500">{exp.duration}</span></p>
                                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{exp.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => { setEditingExperience(exp); setNewExperience({ company: exp.company, role: exp.role, duration: exp.duration, isCurrent: exp.isCurrent || false, location: exp.location || '', description: exp.description, skills: Array.isArray(exp.skills) ? exp.skills.join(', ') : (exp.skills || ''), link: exp.link || '', proof: exp.proof || '' }); }}
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center text-zinc-700 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all cursor-pointer"
                                                    title="Edit experience"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExperience(exp._id)}
                                                    className="shrink-0 w-7 h-7 flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
                                                    title="Delete experience entry"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
