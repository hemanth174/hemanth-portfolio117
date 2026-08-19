/**
 * Global Client-side Event & Visitor Tracking Engine
 */

export interface TrackingEvent {
  category: 'page_view' | 'project' | 'workflow' | 'resume' | 'contact' | 'social' | 'theme' | 'navigation' | 'interaction';
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('portfolio_session_id');
  if (!id) {
    id = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('portfolio_session_id', id);
  }
  return id;
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getBrowserAndOS(): { browser: string; os: string } {
  if (typeof window === 'undefined') return { browser: 'unknown', os: 'unknown' };
  const ua = navigator.userAgent;

  let os = 'Unknown OS';
  if (/windows phone/i.test(ua)) os = 'Windows Phone';
  else if (/win/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ipad|iphone|ipod/i.test(ua)) os = 'iOS';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { browser, os };
}

export async function trackEvent(event: TrackingEvent) {
  if (typeof window === 'undefined') return;

  try {
    const { browser, os } = getBrowserAndOS();
    const payload = {
      ...event,
      page: window.location.pathname,
      referrer: document.referrer || '',
      sessionId: getSessionId(),
      device: getDeviceType(),
      browser,
      os,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
    };

    const data = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Fail silently so user experience is never interrupted
  }
}

// Specialized helpers for high-frequency tracking
export function trackProjectClick(projectTitle: string, actionType: 'live_demo' | 'code_repo' | 'view_details' | 'colab_notebook', projectScale?: string) {
  trackEvent({
    category: 'project',
    action: actionType,
    label: projectTitle,
    metadata: {
      projectTitle,
      actionType,
      projectScale: projectScale || 'big',
    },
  });
}

export function trackResumeAction(action: 'view' | 'download') {
  trackEvent({
    category: 'resume',
    action: action === 'download' ? 'resume_download' : 'resume_view',
    label: 'Resume PDF',
    metadata: { action },
  });
}

export function trackWorkflowAction(workflowTitle: string, action: 'view' | 'live_click' | 'download_json') {
  trackEvent({
    category: 'workflow',
    action,
    label: workflowTitle,
    metadata: { workflowTitle },
  });
}

export function trackContactAction(action: 'start_fill' | 'submitted' | 'social_click', target?: string) {
  trackEvent({
    category: 'contact',
    action,
    label: target || 'Contact Form',
    metadata: { target },
  });
}

export function trackThemeToggle(theme: 'dark' | 'light') {
  trackEvent({
    category: 'theme',
    action: 'switch_theme',
    label: theme,
    metadata: { theme },
  });
}
