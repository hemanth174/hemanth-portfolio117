'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/tracker';

export const VisitorTracker = () => {
  useEffect(() => {
    // 1. Track page view once per route/session
    const sessionKey = 'portfolio_page_' + window.location.pathname;
    if (!sessionStorage.getItem(sessionKey)) {
      trackEvent({
        category: 'page_view',
        action: 'view_page',
        label: window.location.pathname,
        metadata: {
          title: document.title,
          url: window.location.href,
        },
      });
      sessionStorage.setItem(sessionKey, 'true');
    }

    // 2. Global listener for external link clicks, theme toggles, etc.
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href');
      const text = target.textContent?.trim() || '';

      if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:'))) {
        // External link or social click
        if (href.includes('github.com')) {
          trackEvent({ category: 'social', action: 'github_click', label: href, metadata: { text } });
        } else if (href.includes('linkedin.com')) {
          trackEvent({ category: 'social', action: 'linkedin_click', label: href, metadata: { text } });
        } else if (href.startsWith('mailto:')) {
          trackEvent({ category: 'social', action: 'email_click', label: href, metadata: { text } });
        } else if (!href.includes(window.location.hostname)) {
          trackEvent({ category: 'interaction', action: 'external_link_click', label: href, metadata: { text } });
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  return null;
};
