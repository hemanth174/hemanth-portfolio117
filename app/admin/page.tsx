"use client";
import {
  useState,
  useEffect,
  useCallback,
  useTransition,
  Suspense,
} from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Trophy,
  Activity,
  Globe,
  Mail,
  FolderGit2,
  Award,
  Calendar,
  Workflow,
  Briefcase,
   MoreHorizontal,
  X,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ProjectPerformanceTab } from "@/components/admin/ProjectPerformanceTab";
import { ActivityStreamTab } from "@/components/admin/ActivityStreamTab";
import { VisitorAnalyticsTab } from "@/components/admin/VisitorAnalyticsTab";
import { ContactsTab } from "@/components/admin/ContactsTab";
import { ManageProjectsTab } from "@/components/admin/ManageProjectsTab";
import { ManageCertificationsTab } from "@/components/admin/ManageCertificationsTab";
import { ManageEventsTab } from "@/components/admin/ManageEventsTab";
import { ManageWorkflowsTab } from "@/components/admin/ManageWorkflowsTab";
import { ManageExperienceTab } from "@/components/admin/ManageExperienceTab";

import {
  AdminTab,
  AdminUser,
  AnalyticsData,
  Contact,
  Project,
  Certification,
  TimelineEvent,
  N8nWorkflow,
  WorkExperience,
} from "@/components/admin/AdminTypes";

// Inner component that safely uses useSearchParams (needs Suspense boundary)
function AdminLoginWithParams({
  isDarkTheme,
  onToggleTheme,
}: {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}) {
  const searchParams = useSearchParams();
  return (
    <AdminLogin
      isDarkTheme={isDarkTheme}
      onToggleTheme={onToggleTheme}
      errorMessage={searchParams.get("error")}
      attemptedEmail={searchParams.get("attempted_email")}
    />
  );
}

export default function AdminDashboard() {
  const { theme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [, startTransition] = useTransition();

  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  // Check authentication session on mount
  useEffect(() => {
    setThemeMounted(true);
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Unauthenticated
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      // ignore
    } finally {
      setAnalyticsLoading(false);
    }
  }, [timeRange]);

  // Fetch Data Collections
  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const fetchCertifications = useCallback(async () => {
    setCertsLoading(true);
    try {
      const res = await fetch("/api/certificates");
      if (res.ok) {
        const data = await res.json();
        setCertifications(data.certificates || []);
      }
    } finally {
      setCertsLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchWorkflows = useCallback(async () => {
    setWorkflowsLoading(true);
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
      }
    } finally {
      setWorkflowsLoading(false);
    }
  }, []);

  const fetchExperiences = useCallback(async () => {
    setExperiencesLoading(true);
    try {
      const res = await fetch("/api/experience");
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.experiences || []);
      }
    } finally {
      setExperiencesLoading(false);
    }
  }, []);

  // Trigger data fetches on login
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAnalytics();
    fetchContacts();
    fetchProjects();
    fetchCertifications();
    fetchEvents();
    fetchWorkflows();
    fetchExperiences();
  }, [
    isAuthenticated,
    fetchAnalytics,
    fetchContacts,
    fetchProjects,
    fetchCertifications,
    fetchEvents,
    fetchWorkflows,
    fetchExperiences,
  ]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = "/admin";
    }
  };

  const isDarkTheme = themeMounted ? theme !== "light" : true;
  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  // Loading state during session check
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render Login if not authenticated
  if (!isAuthenticated) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
            <div className="w-9 h-9 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        }
      >
        <AdminLoginWithParams
          isDarkTheme={isDarkTheme}
          onToggleTheme={toggleTheme}
        />
      </Suspense>
    );
  }

  // Navigation tab descriptors
  const tabs = [
    { id: "overview" as AdminTab, label: "Overview", icon: BarChart3 },
    {
      id: "project_perf" as AdminTab,
      label: "Project Performance",
      icon: Trophy,
    },
    { id: "activity" as AdminTab, label: "Activity Stream", icon: Activity },
    { id: "visitors" as AdminTab, label: "Audience Analytics", icon: Globe },
    {
      id: "contacts" as AdminTab,
      label: `Inquiries (${contacts.length})`,
      icon: Mail,
    },
    { id: "projects" as AdminTab, label: "Projects", icon: FolderGit2 },
    { id: "certifications" as AdminTab, label: "Certificates", icon: Award },
    { id: "events" as AdminTab, label: "Events", icon: Calendar },
    { id: "workflows" as AdminTab, label: "n8n Workflows", icon: Workflow },
    { id: "experience" as AdminTab, label: "Experience", icon: Briefcase },
  ];

  return (
    <div
      className={`admin-shell ${isDarkTheme ? "admin-dark" : "admin-light"} min-h-screen font-sans`}
    >
      <AdminHeader
        user={user}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8 space-y-8">
        {/* Navigation Tabs */}
       {/* Navigation Tabs */}

{/* ================= DESKTOP NAV ================= */}
<div className="hidden md:flex w-full justify-center">
  <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 overflow-x-auto shadow-sm">

    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          onClick={() => startTransition(() => setActiveTab(tab.id))}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
            isActive
              ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          <Icon
            size={14}
            className={isActive ? "text-black" : "text-zinc-500"}
          />

          {tab.label}
        </button>
      );
    })}

  </div>
</div>


{/* ================= MOBILE NAV ================= */}
<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">

  <div className="relative">

    {/* More Menu */}
    {showMoreMenu && (
      <div className="absolute bottom-16 right-0 w-56 p-2 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">

        {tabs.slice(4).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                startTransition(() => setActiveTab(tab.id));
                setShowMoreMenu(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-yellow-400 text-black"
                  : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}

      </div>
    )}


    {/* Bottom Navigation */}
    <div className="flex items-center justify-around gap-1 p-2 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl">

      {/* First 4 Tabs */}
      {tabs.slice(0, 4).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              startTransition(() => setActiveTab(tab.id));
              setShowMoreMenu(false);
            }}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all ${
              isActive
                ? "bg-yellow-400 text-black"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Icon size={18} />

            <span className="text-[9px] font-bold truncate max-w-[60px]">
              {tab.label}
            </span>
          </button>
        );
      })}


      {/* More Button */}
      <button
        onClick={() => setShowMoreMenu((prev) => !prev)}
        className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all ${
          showMoreMenu
            ? "bg-yellow-400 text-black"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {showMoreMenu ? (
          <X size={18} />
        ) : (
          <MoreHorizontal size={18} />
        )}

        <span className="text-[9px] font-bold">
          More
        </span>
      </button>

    </div>

  </div>
</div>

        {/* Tab Content Display */}
        <div>
          {activeTab === "overview" && (
            <StatsOverview
              analytics={analytics}
              loading={analyticsLoading}
              timeRange={timeRange}
              onTimeRangeChange={(r) => {
                setTimeRange(r);
                fetchAnalytics();
              }}
              onRefresh={fetchAnalytics}
            />
          )}

          {activeTab === "project_perf" && (
            <ProjectPerformanceTab
              projects={analytics?.projectPerformance || []}
              loading={analyticsLoading}
            />
          )}

          {activeTab === "activity" && (
            <ActivityStreamTab
              events={analytics?.recentEvents || []}
              loading={analyticsLoading}
              onRefresh={fetchAnalytics}
            />
          )}

          {activeTab === "visitors" && (
            <VisitorAnalyticsTab
              analytics={analytics}
              loading={analyticsLoading}
            />
          )}

          {activeTab === "contacts" && (
            <ContactsTab
              contacts={contacts}
              loading={contactsLoading}
              onRefresh={fetchContacts}
              onDelete={async (id) => {
                if (!window.confirm("Delete message?")) return;
                const res = await fetch(`/api/contact?id=${id}`, {
                  method: "DELETE",
                });
                if (res.ok)
                  setContacts((prev) => prev.filter((c) => c._id !== id));
              }}
            />
          )}

          {activeTab === "projects" && (
            <ManageProjectsTab
              projects={projects}
              loading={projectsLoading}
              onRefresh={fetchProjects}
              onSave={async (p, isEdit) => {
                const res = await fetch("/api/projects", {
                  method: isEdit ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(p),
                });
                if (res.ok) {
                  fetchProjects();
                  fetchAnalytics();
                }
              }}
              onDelete={async (id) => {
                if (!window.confirm("Delete project?")) return;
                const res = await fetch(`/api/projects?id=${id}`, {
                  method: "DELETE",
                });
                if (res.ok) {
                  fetchProjects();
                  fetchAnalytics();
                }
              }}
            />
          )}

          {activeTab === "certifications" && (
            <ManageCertificationsTab
              certifications={certifications}
              loading={certsLoading}
              onRefresh={fetchCertifications}
              onSave={async (c, isEdit) => {
                const res = await fetch("/api/certificates", {
                  method: isEdit ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(c),
                });
                if (res.ok) fetchCertifications();
              }}
              onDelete={async (id) => {
                if (!window.confirm("Delete certificate?")) return;
                const res = await fetch(`/api/certificates?id=${id}`, {
                  method: "DELETE",
                });
                if (res.ok) fetchCertifications();
              }}
            />
          )}

          {activeTab === "events" && (
            <ManageEventsTab
              events={events}
              loading={eventsLoading}
              onRefresh={fetchEvents}
              onSave={async (ev, isEdit) => {
                const res = await fetch("/api/events", {
                  method: isEdit ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(ev),
                });
                if (res.ok) fetchEvents();
              }}
              onDelete={async (id) => {
                if (!window.confirm("Delete event?")) return;
                const res = await fetch(`/api/events?id=${id}`, {
                  method: "DELETE",
                });
                if (res.ok) fetchEvents();
              }}
            />
          )}

          {activeTab === "workflows" && (
            <ManageWorkflowsTab
              workflows={workflows}
              loading={workflowsLoading}
              onRefresh={fetchWorkflows}
              onSave={async (wf, isEdit) => {
                const res = await fetch("/api/workflows", {
                  method: isEdit ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(wf),
                });
                if (res.ok) fetchWorkflows();
              }}
              onDelete={async (id) => {
                if (!window.confirm("Delete workflow?")) return;
                const res = await fetch(`/api/workflows?id=${id}`, {
                  method: "DELETE",
                });
                if (res.ok) fetchWorkflows();
              }}
            />
          )}

          {activeTab === "experience" && (
            <ManageExperienceTab
              experiences={experiences}
              loading={experiencesLoading}
              onRefresh={fetchExperiences}
              onSave={async (exp, isEdit) => {
                const res = await fetch("/api/experience", {
                  method: isEdit ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(exp),
                });
                if (res.ok) fetchExperiences();
              }}
              onDelete={async (id) => {
                if (!window.confirm("Delete experience entry?")) return;
                const res = await fetch(`/api/experience?id=${id}`, {
                  method: "DELETE",
                });
                if (res.ok) fetchExperiences();
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
