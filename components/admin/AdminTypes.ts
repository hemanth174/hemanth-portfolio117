export type AdminTab = 
  | 'overview'
  | 'project_perf'
  | 'activity'
  | 'visitors'
  | 'contacts'
  | 'projects'
  | 'certifications'
  | 'events'
  | 'workflows'
  | 'experience';

export interface AdminUser {
  email: string;
  name?: string;
  picture?: string;
}

export interface OverviewMetrics {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  totalContacts: number;
  totalProjectClicks: number;
  totalResumeDownloads: number;
}

export interface ProjectPerformance {
  id: string;
  title: string;
  category: string;
  projectType: 'big' | 'small';
  image?: string;
  liveUrl?: string;
  codeUrl?: string;
  views: number;
  liveClicks: number;
  codeClicks: number;
  colabClicks: number;
  totalClicks: number;
  totalInteractions: number;
  ctr: number;
  lastInteractedAt: string;
}

export interface ActivityEvent {
  _id: string;
  category: string;
  action: string;
  label?: string;
  page?: string;
  device?: string;
  browser?: string;
  os?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface DailyTrendItem {
  _id: string;
  visits: number;
  uniques: number;
}

export interface CategoryStat {
  name: string;
  count: number;
}

export interface AnalyticsData {
  overview: OverviewMetrics;
  dailyTrend: DailyTrendItem[];
  projectPerformance: ProjectPerformance[];
  recentEvents: ActivityEvent[];
  deviceStats: CategoryStat[];
  browserStats: CategoryStat[];
  referrerStats: CategoryStat[];
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface StoryStat {
  value: string;
  label: string;
}

export interface StoryPhase {
  label: string;
  title: string;
  desc: string;
  marker?: boolean;
}

export interface StoryDecision {
  decision: string;
  rejected: string;
  reason: string;
}

export interface Project {
  _id?: string;
  id?: number;
  title: string;
  category: string;
  projectType?: 'big' | 'small';
  description: string;
  image?: string;
  codeUrl?: string;
  liveUrl?: string;
  order?: number;
  createdAt?: string;
  // ── Project story fields (power the READ THE STORY page) ──
  tagline?: string;
  videoUrl?: string;
  stack?: string[];
  problemHeading?: string;
  problem?: string[];
  constraints?: string[];
  processHeading?: string;
  processIntro?: string;
  phases?: StoryPhase[];
  decisions?: StoryDecision[];
  outcomeHeading?: string;
  outcomeBody?: string[];
  role?: string;
  rolePoints?: string[];
  reflectionHeading?: string;
  reflection?: string;
  stats?: StoryStat[];
}

export interface Certification {
  _id?: string;
  id?: number;
  title: string;
  img: string;
  createdAt?: string;
}

export interface TimelineEvent {
  _id?: string;
  id?: number;
  title: string;
  type: 'college' | 'off-college';
  date: string;
  description: string;
  story?: string;
  tags?: string[];
  location: string;
  image?: string;
  link?: string;
  createdAt?: string;
}

export interface N8nWorkflow {
  _id?: string;
  title: string;
  description: string;
  category: string;
  tags?: string[] | string;
  thumbnail?: string;
  nodeCount?: number;
  workflowJson?: string;
  createdAt?: string;
}

export interface WorkExperience {
  _id?: string;
  company: string;
  role: string;
  duration: string;
  isCurrent: boolean;
  location?: string;
  description: string;
  skills?: string[] | string;
  link?: string;
  proof?: string;
  createdAt?: string;
}
